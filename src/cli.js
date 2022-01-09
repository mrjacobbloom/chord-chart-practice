import { getRandomChord } from './getRandomChord.js';

const preamble = `[UP and DOWN] to control tempo.
[1-9] to control measure length.
[e] to simplify enharmonics (Fb, B#, etc.)
Press any other key to exit.\n\n`;

const state = {
  // The user-configurable options
  tempo: 60,
  timeSignature: 4,
  simplifyEnharmonics: false,

  // Other state
  beat: -1,
  chord: '',
  nextChord: '',
};

/**
 * Dim some text in the terminal.
 * 
 * @type {(str: any) => string}
 */
const dimText = (str) => `\u001B[2m${str}\u001B[22m`;

/**
 * Get the number of milliseconds in a beat.
 * `setTimeout` isn't actually that precise, but that's okay since we're only ever scheduling 1 event into the future.
 */
const getMSPerBeat = () => 60 * 1000 / state.tempo;
 
/**
 * Generate the "chord line" of the CLI: progress bar, chord name, and next chord.
 */
const genChordLine = () => {
  const progressBar = '▓'.repeat(state.beat + 1) + '░'.repeat(Math.max(state.timeSignature - state.beat - 1, 0));
  const nextChordPart = dimText(`(next: ${state.nextChord})`);
  return `${progressBar} ${state.chord} ${nextChordPart}`;
};

/** @type {NodeJS.Timeout} */ let timeout;
 
/**
 * Stuff that happens at the beginning of each measure (choosing the next chord and setting beat to 0)
 */
const nextMeasure = () => {
  state.beat = 0;
  state.chord = state.nextChord || getRandomChord(state.simplifyEnharmonics);
  state.nextChord = getRandomChord(state.simplifyEnharmonics);
};

/**
 * The main loop. Runs on each "beat" to redraw the interface.
 */
const mainLoop = () => {
  if (state.beat === -1 || state.beat >= state.timeSignature) nextMeasure();

  console.clear();
  console.log(`Tempo: ${state.tempo} ${dimText('-- change: [↑] & [↓]')}`);
  console.log(`Time Signature: ${state.timeSignature} ${dimText('-- change: [1-9]')}`);
  console.log(`Simplify (Cb→B, etc): ${state.simplifyEnharmonics ? 'ON' : 'OFF'} ${dimText('-- toggle: [e]')}`);
  console.log('Press any other key to exit.');
  console.log('');
  process.stdout.write(genChordLine()); // use stdout.write just to keep cursor on this line.

  state.beat += 1;
  timeout = setTimeout(mainLoop, getMSPerBeat());
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

  // Restart the main loop so the effect happens immediately (instead of on the next beat)
  clearTimeout(timeout);
  mainLoop();
});

export const start = mainLoop;
