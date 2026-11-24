// Build a very naive model of chord changes using the iReal 1300 jazz standards to answer "given the last 2 chords' motion, what's the next chord most likely to be?"
// I know nothing about statistics or modeling, I'm just making this up. This entire project is for fun so

// @ts-check
/// <reference path="../src/interfaces.d.ts" />
import * as tonal from 'tonal';
import fs from 'fs/promises';
import iRealReader from 'ireal-parse';

// Run ireal-parse on its included 1300.txt to get iReal song data
const sourceRaw = await fs.readFile('./node_modules/ireal-parse/data_in/1300.txt');
const reader = new iRealReader(sourceRaw, new RegExp(''));

// turn each song into a flat array of its chords in source order. This is wrong for repeats and things, but hopefully it's fine
let flat = /** @type {string[][]} **/ (reader.songs.map(s => s.chartData?.flatMap(m => m.barData).filter(Boolean)));
console.log('songs list length', flat.length);
flat = flat.filter(Boolean);
console.log('songs list with empty songs removed', flat.length);

/**
 * @typedef {[string, string, string]} Run A "run" of 3 chords from a jazz standard
 */

/**
 * Split a song into "runs" of 3 chords
 * @param {string[]} songChords
 * @returns {Run[]}
 */
function getRuns(songChords) {
  /** @type { Run[] } */ const out = [];
  for (let i = 0; i < songChords.length - 2; i++) {
    out.push([songChords[i], songChords[i + 1], songChords[i + 2]])
  }
  return out;
}

// Split all the songs into "runs" of 3 chords, and join this all together into 1 giant list
let runs = flat.flatMap(getRuns);
console.log('runs.length', runs.length);

// Filter out runs where 2 neighboring chords are the same
runs = runs.filter(r => r[0] !== r[1] && r[1] !== r[2]);
console.log('runs.length withOUT duplicate neighboring chords', runs.length);

/**
 * @param {string | null} note1 
 * @param {string | null} note2 
 * @returns {Cadence.Interval | undefined}
 */
const toCadenceInterval = (note1, note2) => {
  if (!note1 || !note2) return undefined;
  const name = tonal.Interval.distance(note1, note2);
  return {
    name,
    semitones: tonal.Interval.semitones(name)
  };
};

/**
 * 
 * @param {tonal.Chord.Chord} tonalChord 
 * @returns {Cadence.Chord}
 */
const toCadenceChord = (tonalChord) => ({
  quality: tonalChord.quality,
  family: tonalChord.family,
  symbol: tonalChord.aliases[0],
  bassInterval: tonalChord.bass ? toCadenceInterval(tonalChord.tonic, tonalChord.bass) : undefined
});

/**
 * Given a "run" of 3 chord names, returns a "cadence" tracking its movement and chord qualities
 * @param {Run} run
 * @returns {Cadence | undefined}
 */
function runToCadence(run) {
  const chord1 = tonal.Chord.get(run[0]);
  const chord2 = tonal.Chord.get(run[1]);
  const chord3 = tonal.Chord.get(run[2]);

  if (chord1.empty || chord2.empty || chord3.empty) return undefined;

  const interval1 = toCadenceInterval(chord1.tonic, chord2.tonic);
  const interval2 = toCadenceInterval(chord2.tonic, chord3.tonic);

  if (!interval1 || !interval2) return undefined;

  return {
    frequency: 1,
    chord1: toCadenceChord(chord1),
    chord2: toCadenceChord(chord2),
    chord3: toCadenceChord(chord3),
    interval1,
    interval2,
  }
}

// Now use Tonal to turn each run into a "cadence" tracking its movement and chord qualities
const cadences = /** @type {Cadence[]} */ (runs.map(runToCadence).filter(Boolean));

/**
 * Given a cadence, return a unique string so identical cadences can be grouped together. This doesn't have to be pretty, it's just for deduplication
 * @param {Cadence} cadence
 */
const cadenceToHash = ({ chord1, chord2, chord3, interval1, interval2 }) => `${chord1.symbol}:${chord1.bassInterval?.name || ''}:${chord2.symbol}:${chord2.bassInterval?.name || ''}:${chord3.symbol}:${chord3.bassInterval?.name || ''}:${interval1.name}:${interval2.name}`;
/** @type {Map<string, Cadence>} */ const cadenceMap = new Map();


// before dropping failures:
  // flat list size 49766
  // map size 13383
// after: map size 12984

// Combine the cadences
for (const cadence of cadences) {
  const hash = cadenceToHash(cadence);
  if (cadenceMap.has(hash)) {
    (/** @type {Cadence} */ (cadenceMap.get(hash))).frequency += 1;
  } else {
    cadenceMap.set(hash, cadence);
  }
}

console.log('flat list size', cadences.length);
console.log('map size', cadenceMap.size);

// sort by frequency, highest to lowest
const sortedDedupedCadences = [...cadenceMap.values()].sort((a, b) => b.frequency - a.frequency);

// save as a flat JSON list. Figuring out how to efficiently use this data is the responsibility of the consuming app
await fs.writeFile(`./resources/cadenceData.json`, JSON.stringify(sortedDedupedCadences));