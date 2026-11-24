import tonal from 'tonal';
import path from 'path';
import fs from 'fs';
import { KEYS, ACCIDENTALS, ACCIDENTALS_WITH_DOUBLES, ENHARMONIC, QUALITIES } from './theoryConstants.js';

const cadenceDataPath = path.resolve('./resources/cadenceData.json');
const cadenceDataRaw = fs.readFileSync(cadenceDataPath, 'utf-8');
/** @type {Cadence[]} */ const CADENCE_DATA = JSON.parse(cadenceDataRaw);

/**
 * Given a predicate function, append the matching cadences to the guesses function until we
 * have the wanted number of guesses.
 * @param {Cadence[]} guesses
 * @param {(c: Cadence) => boolean} predicate
 */
const appendGuesses = (guesses, predicate) => {
  for (let i = 0; i < CADENCE_DATA.length && guesses.length < 8; i++) {
    const cadence = CADENCE_DATA[i];
    if (!guesses.includes(cadence) && predicate(cadence)) {
      guesses.push(cadence);
    }
  }
}

/**
 * Given the previous 2 chords, predict the next one. Uses cadence data derived from the iReal 1300 standard songbook.
 * @param {object} options
 * @param {string} options.chord1String
 * @param {string} options.chord2String
 * @param {number} options.prediction From settings: number from 0-1 defining chord prediction mode (random or statistical)
 * @param {number} options.complexity From settings: number from 0-3 defining chord complexity
 * @param {boolean} options.bassNotes From settings: whether to show bass notes
 * @param {number} options.accidentals From settings: number from 0-3 defining accidental complexity
 * @returns {string}
 */
export const predictNextChord = ({
  chord1String,
  chord2String,
  prediction,
  complexity,
  bassNotes,
  accidentals
}) => {
  if (prediction === 0) { // Random prediction mode
    return getRandomChord(complexity, accidentals, bassNotes);
  }

  const chord1 = tonal.Chord.get(chord1String);
  const chord2 = tonal.Chord.get(chord2String);
  if (chord1.empty || chord2.empty) return getRandomChord(complexity, accidentals, bassNotes);

  const interval = tonal.Interval.distance(chord1.tonic || '', chord2.tonic || '');
  const chord1BassInterval = chord1.bass ? tonal.Interval.distance(chord1.tonic || '', chord1.bass) : undefined;
  const chord2BassInterval = chord2.bass ? tonal.Interval.distance(chord2.tonic || '', chord2.bass) : undefined;

  /** @type {Cadence[]} */ const cadenceGuesses = [];

  // Pass 1: matching symbol and bass note
  if (chord1BassInterval || chord2BassInterval) {
    appendGuesses(cadenceGuesses, (cadence) => (
      chord1.aliases[0] === cadence.chord1.symbol
      && chord2.aliases[0] === cadence.chord2.symbol
      && interval == cadence.interval1.name
      && (chord1BassInterval === cadence.chord1.bassInterval
        || chord2BassInterval === cadence.chord2.bassInterval
      )
    ));
  }

  // Pass 2: matching symbol
  appendGuesses(cadenceGuesses, (cadence) => (
    chord1.aliases[0] === cadence.chord1.symbol
    && chord2.aliases[0] === cadence.chord2.symbol
    && interval == cadence.interval1.name
  ));

  // Pass 3: matching quality
  appendGuesses(cadenceGuesses, (cadence) => (
    chord1.quality === cadence.chord1.quality
    && chord2.quality === cadence.chord2.quality
    && interval == cadence.interval1.name
  ));

  // Pass 4: matching family
  appendGuesses(cadenceGuesses, (cadence) => (
    chord1.family === cadence.chord1.family
    && chord2.family === cadence.chord2.family
    && interval == cadence.interval1.name
  ));

  // @todo: weight these? concept of temperature?
  shuffle(cadenceGuesses);
  for (const cadence of cadenceGuesses) {
    const tonic = tonal.Note.transpose(chord2.tonic || '', cadence.interval2.name);
    const chord = renderChordWithComplexity({
      tonic,
      symbol: cadence.chord3.symbol,
      bassNote: cadence.chord3.bassInterval ? tonal.Note.transpose(tonic, cadence.chord3.bassInterval.name) : null,
      complexity,
      bassNotes,
      accidentals
    });

    if (chord) return chord;
  }

  return getRandomChord(complexity, accidentals, bassNotes);
};

/**
 * Render the given chord, respecting the complexity/etc settings, or return null if it's not possible.
 * @param {object} options
 * @param {string} options.tonic
 * @param {string} options.symbol
 * @param {string | null} options.bassNote
 * @param {number} options.complexity From settings: number from 0-3 defining chord complexity
 * @param {boolean} options.bassNotes From settings: whether to show bass notes
 * @param {number} options.accidentals From settings: number from 0-3 defining accidental complexity
 * @returns {string | null}
 */
function renderChordWithComplexity({
  tonic,
  symbol,
  bassNote,
  complexity,
  bassNotes,
  accidentals,
}) {
  if (
      tonic.match(/bbb|###/) // The cadences are biased toward diminished intervals. Without this, they build up and you get Abbbbbbbbbbm7 etc.
      || (accidentals <= 2 && tonic.match(/bb|##/)) // no double-accidentals
      || (accidentals <= 1 && ENHARMONIC.includes(tonic)) // avoid Cb, etc
      || accidentals === 0 // no accidentals
    ) {
      tonic = tonal.Note.simplify(tonic);
    }

    if (accidentals === 0 && tonic.match(/b|#/)) {
      return null;
    }

    if (complexity === 0) { // triads & suspensions
      if (symbol.match(/7|9|11|13|#|b/)) return null;
    } else if (complexity === 1) { // 7ths
      if (symbol.match(/9|11|13|#|b/)) return null;
    } else if (complexity === 2) { // chord extensions
      if (symbol.match(/#|b/)) return null;
    } // else altered chords, which need no simplification
    
    return `${tonic}${symbol}${bassNote && bassNotes ? `/${bassNote}` : ''}`;
}

/**
 * Pick a random item from an array.
 *
 * @type {<T>(arr: T[]) => T}
 */
const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

/**
 * Get subset of QUALITIES up to a certain level of complexity
 * @param {number} complexity Number from 0-3 defining chord complexity
 * @returns {string[][]}
 */
const getQualitiesAtComplexity = (complexity) => {
  const out = [];
  for(let i = 0; i <= complexity; i++) out.push(...QUALITIES[i]);
  return out;
}

/**
 * In-place shuffle function from https://stackoverflow.com/a/2450976
 * @param {any[]} array
 */
function shuffle(array) {
  let currentIndex = array.length;

  // While there remain elements to shuffle...
  while (currentIndex != 0) {

    // Pick a remaining element...
    let randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }
}

/**
 * Generate a random chord string.
 * @param {number} complexity From settings: number from 0-3 defining chord complexity
 * @param {boolean} bassNotes From settings: whether to show bass notes
 * @param {number} accidentals From settings: number from 0-3 defining accidental complexity
 * @returns {string} A random chord as a string.
 */
const getRandomChord = (complexity, accidentals, bassNotes) => {
  /** @type {string} */ let tonic;

  let availableAccidentals = [''];
  const simplifyEnharmonics = accidentals === 1;
  if (accidentals === 1 /* Avoid Enharmonics (ex. no Cb) */ || accidentals === 2 /* Single-Accidentals */) {
    availableAccidentals = ACCIDENTALS;
  } else if (accidentals === 3 /* Double-Accidentals */) {
    availableAccidentals = Math.random() < 0.25 ? ACCIDENTALS_WITH_DOUBLES : ACCIDENTALS;
  }

  do {
    tonic = `${pickRandom(KEYS)}${pickRandom(availableAccidentals)}`
  } while(simplifyEnharmonics && ENHARMONIC.includes(tonic)) // yay for nondeterminism!
  const symbol = pickRandom(pickRandom(getQualitiesAtComplexity(complexity)));

  let bassNote = '';
  if (bassNotes && Math.random() < 0.2) {
    const [_, ...chordNotes] = tonal.Chord.notes(symbol, tonic);
    if (chordNotes.length) {
      bassNote = `/${pickRandom(chordNotes)}`
    }
  }
  return `${tonic}${symbol}${bassNote}`;
};
