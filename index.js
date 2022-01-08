// User-configurable stuff
let tempo = 60;
let beatsPerMeasure = 4;
let simplifyEnharmonics = false;

const KEYS = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
const ACCIDENTALS = ['', 'b', '#'];
const ENHARMONIC = ['Cb', 'B#', 'Fb', 'E#'];
const QUALITIES = [
  /********** Triads **********/
  /* Major      */ ['', 'M'],
  /* Minor      */ ['m', '-'],
  /* Diminished */ ['dim', '°'],
  /* Augmented  */ ['aug', '+'],

  /********** Suspensions / NCTs **********/
  /* Major      */ ['sus2', 'sus4', '6'],
  /* Minor      */ ['-sus4', '-6'],

  /********** 7ths **********/
  /* Dominant   */ ['7'],
  /* Major      */ ['M7', 'Δ7', 'Maj7'],
  /* Minor      */ ['-7', 'm7', 'min7'],
  /* Fully-Diminished */ ['dim7', '°7'],
  /* Half-Diminished  */ ['ø7', 'm7b5'],

  /********** 9ths **********/
  /* Dominant   */ ['9'],
  /* Major      */ ['M9', 'Δ9', 'Maj9'],
  /* Minor      */ ['-9', 'm9', 'min9'],

  /********** 11ths **********/
  /* Dominant   */ ['11'],
  /* Major      */ ['M11', 'Δ11', 'Maj11'],
  /* Minor      */ ['-11', 'm11', 'min11'],

  /********** 13ths **********/
  /* Dominant   */ ['13'],
  /* Major      */ ['M13', 'Δ13', 'Maj13'],
  /* Minor      */ ['-13', 'm13', 'min13'],
];

/**
 * Pick a random item from an array.
 *
 * @type {<T>(arr: T[]) => T}
 */
const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

/**
 * Generate a random chord string.
 */
const genChord = () => {
  /** @type {string} */ let tonic;
  do {
    tonic = `${pickRandom(KEYS)}${pickRandom(ACCIDENTALS)}`
  } while(simplifyEnharmonics && ENHARMONIC.includes(tonic)) // yay for nondeterminism!
  const quality = pickRandom(pickRandom(QUALITIES));
  return `${tonic}${quality}`;
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
const getMSPerBeat = () => 60 * 1000 / tempo;

/**
 * Generate the "chord line" of the CLI: progress bar, chord name, and optionally the next chord.
 * 
 * @type {(beat: number, chord: string, nextChord?: string) => string}
 */
const genChordLine = (beat, chord, nextChord) => {
  const progressBar = '▓'.repeat(beat + 1) + '░'.repeat(Math.max(beatsPerMeasure - beat - 1, 0));
  const nextChordPart = nextChord ? dimText(`(next: ${nextChord})`) : '';
  return `${progressBar} ${chord} ${nextChordPart}`;
};

/**
 * Generate the "feedback line" of the CLI: the kinda grayed-out one with tempo, beats-per-measure, etc.
 */
const genFeedbackLine = () => dimText(`Tempo ${tempo} | Time Sig ${beatsPerMeasure}/4 | Simplify ${simplifyEnharmonics ? 'ON' : 'OFF'}`);

/** @type {number} */ let beat;
/** @type {string} */ let chord;
/** @type {string} */ let nextChord;
/** @type {NodeJS.Timeout} */ let timeout;

/**
 * Stuff that happens at the beginning of each measure (choosing the next chord and setting beat to 0)
 */
const nextMeasure = () => {
  beat = 0;
  chord = nextChord || genChord();
  nextChord = genChord();
};

const mainLoop = () => {
  if (beat >= beatsPerMeasure) nextMeasure();

  process.stdout.moveCursor(0, -1) // up 1 line
  process.stdout.clearScreenDown();
  process.stdout.write(`\r${genFeedbackLine()}\n${genChordLine(beat, chord, nextChord)}`);

  beat += 1;
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
      tempo += 20;
      break;
    }
    case '\u001B\u005B\u0042': { // down
      tempo = Math.max(tempo - 20, 20);
      break;
    }
    case 'e': {
      simplifyEnharmonics = !simplifyEnharmonics;
      break;
    }
    default: {
      const asNumber = Number(keyString);
      if (asNumber) {
        beatsPerMeasure = asNumber;

      } else {
        process.exit();
      }
    }
  }

  // Restart the main loop so the effect happens immediately (instead of on the next beat)
  clearTimeout(timeout);
  mainLoop();
});

console.clear();
console.log(`[UP and DOWN] to control tempo.
[1-9] to control measure length.
[e] to simplify enharmonics (Fb, B#, etc.)
Press any other key to exit.

`);
nextMeasure();
mainLoop();
