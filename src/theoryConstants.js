/**
 * All possible keys.
 */
export const KEYS = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];

/**
 * Possible accidentals. Combined with KEYS, it can be used to create any note! Any note at all!
 */
export const ACCIDENTALS = ['', 'b', '#'];

/**
 * The notes that have a simpler enharmonic notation. When "Simplify Enharmonics" is ON, these notes won't be used to generate chords.
 */
export const ENHARMONIC = ['Cb', 'B#', 'Fb', 'E#'];

/**
 * The set of chord qualities. Each item is an array of aliases for the chord, so you can be exposed to different ways it might be written.
 * This list is definitely not exhaustive. If there's one you'd like me to add, open an issue (or a PR).
 * I probably won't add slash-chords, since they require more theory to generate.
 */
export const QUALITIES = [
  /********** Triads **********/
  /* Major      */ ['', 'M'],
  /* Minor      */ ['m', '-'],
  /* Diminished */ ['dim', '°'],
  /* Augmented  */ ['aug', '+'],

  /********** Suspensions / NCTs **********/
  /* Major      */ ['sus2'], ['sus4'], ['6'],
  /* Minor      */ ['-sus4'], ['-6'],

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
