import { COLORS } from './colors.js';
import { getRandomChord } from './getRandomChord.js';
import { Player } from './player.js';

const state = {
  // The user-configurable options
  tempo: 120,
  timeSignature: 4,
  barsPerPhrase: 2,
  metronome: true,
  simplifyEnharmonics: false,

  // Other state
  beat: -2, // Incremented at the start of the main loop, but also.... you know what, just don't worry about it ok
  chord: '',
  nextChord: '',
};

/**
 * Format the given string as a measure (prepend a pipe and center in 8 spaces)
 * @param {string} str 
 */
const formatMeasure = (str) => {
  const length = 8 - str.length;
  return `|${' '.repeat(Math.floor(length/2))}${str}${' '.repeat(Math.ceil(length/2))}`;
}

/**
 * Get the number of milliseconds in a beat.
 * `setTimeout` isn't actually that precise, but that's okay since we're only ever scheduling 1 event into the future.
 */
const getMSPerBeat = () => 60 * 1000 / state.tempo;

/**
 * Get the progress in the phrase, as a number 0-1.
 */
const getProgress = () => (state.beat + 1) / (state.timeSignature * state.barsPerPhrase);

/**
 * Use ANSI color codes to highlight the given string into a progress bar!
 * @param {string} string 
 */
const progressBarIfyString = (string, progress) => {
  const progressLength = Math.round(progress * string.length);
  const progressPart = string.substring(0, progressLength);
  const remainderPart = string.substring(progressLength);
  return `${COLORS.gray(progressPart)}${remainderPart}`;
};
 
/**
 * Generate the "chord line" of the CLI: chord-measures progress bar and next chord.
 */
const genChordLine = () => {
  const thisPhraseRaw = `${formatMeasure(state.chord)}${formatMeasure('%').repeat(state.barsPerPhrase - 1)}`;
  const thisPhraseProgressBar = progressBarIfyString(thisPhraseRaw, getProgress());
  return `${thisPhraseProgressBar}| ${COLORS.dim(state.nextChord)} `; // Space on the end because cursor is ugly
};
 
/**
 * Stuff that happens at the beginning of each measure (choosing the next chord and setting beat to 0)
 */
const nextPhrase = () => {
  state.beat = 0;
  state.chord = state.nextChord || getRandomChord(state.simplifyEnharmonics);
  state.nextChord = getRandomChord(state.simplifyEnharmonics);
};

const player = new Player();
/**
 * Plays the metronome sound. Runs in the "main loop" on each beat.
 */
const doMetronome = () => {
  if (state.metronome) {
    if (state.beat % state.timeSignature === 0) {
      player.play('resources/high.mp3');
    } else {
      player.play('resources/low.mp3');
    }
  }
}

/**
 * Draw the interface. Runs in the "main loop" on each beat, or when a setting changes.
 */
const drawInterface = () => {
  console.clear();
  console.log(`Tempo: ${state.tempo} ${COLORS.dim('-- change: [↑] & [↓]')}`);
  console.log(`Time Signature: ${state.timeSignature}/4 ${COLORS.dim('-- change: [1-9]')}`);
  console.log(`Bars per Phrase: ${state.barsPerPhrase} ${COLORS.dim('-- change: [←] & [→]')}`);
  console.log(`Metronome: ${state.metronome ? 'ON' : 'OFF'} ${COLORS.dim('-- toggle: [m]')}`);
  console.log(`Simplify (Cb→B, etc): ${state.simplifyEnharmonics ? 'ON' : 'OFF'} ${COLORS.dim('-- toggle: [e]')}`);
  console.log('Press any other key to exit.');
  console.log('');
  process.stdout.write(genChordLine()); // use stdout.write just to keep cursor on this line.
}

/**
 * The main loop. Runs on each "beat" to redraw the interface and play the metronome sound.
 */
const mainLoop = () => {
  state.beat += 1;
  if (state.beat === -1 || getProgress() > 1) nextPhrase();

  doMetronome();
  drawInterface();

  setTimeout(mainLoop, getMSPerBeat());
};

// Setup keyboard input
// Adapted from https://stackoverflow.com/a/30687420
process.stdin.setRawMode(true);
process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(key){
  const keyString = key.toString();
  switch (keyString) {
    case '\u001B\u005B\u0041': { // up
      state.tempo += 5;
      break;
    }
    case '\u001B\u005B\u0042': { // down
      state.tempo = Math.max(state.tempo - 5, 20);
      break;
    }
    case '\u001B\u005B\u0043': { // right
      state.barsPerPhrase += 1;
      break;
    }
    case '\u001B\u005B\u0044': { // left
      state.barsPerPhrase = Math.max(state.barsPerPhrase - 1, 1);
      break;
    }
    case 'm': {
      state.metronome = !state.metronome;
      break;
    }
    case 'e': {
      state.simplifyEnharmonics = !state.simplifyEnharmonics;
      break;
    }
    default: {
      const asNumber = Number(keyString);
      if (asNumber) {
        state.timeSignature = asNumber;

      } else {
        process.exit();
      }
    }
  }

  // Redraw the interface immediately so the user believes the feedback is real
  drawInterface();
});

export const start = mainLoop;
