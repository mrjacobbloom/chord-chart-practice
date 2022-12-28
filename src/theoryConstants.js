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
 * The set of chord qualities. Organized by level of complexity, then aliases for each chord.
 * This list is definitely not exhaustive. If there's one you'd like me to add, open an issue (or a PR).
 * I probably won't add slash-chords, since they require more theory to generate.
 * 
 * @type {string[][][]}
 */
export const QUALITIES = [
  /* ########## COMPLEXITY 1: TRIADS AND SUSPENSIONS ########## */ [
    /********** Triads **********/
    /* Major        */ ['', 'M'],
    /* Minor        */ ['m', '-'],
    /* Diminished   */ ['dim', '°'],
    /* Augmented    */ ['aug', '+'],

    /********** Suspensions / NCTs **********/
    /* Major        */ ['sus2'], ['sus4'], ['6'],
    /* Minor        */ ['-sus2'], ['-sus4'], ['-6', 'm6', 'min6'],
  ],

  /* ########## COMPLEXITY 2: 7THS ########## */ [
    /* Dominant     */ ['7'],
    /* Major        */ ['M7', 'Δ7', 'Maj7'],
    /* Minor        */ ['-7', 'm7', 'min7'],
    /* Fully-Diminished */ ['dim7', '°7'],
    /* Half-Diminished  */ ['ø7', 'm7b5', '-7 (b5)', 'm7 (b5)', 'min7 (b5)'],
  ],

  /* ########## COMPLEXITY 3: CHORD EXTENSIONS ########## */ [
    /********** 9ths **********/
    /* Dominant     */ ['9'],
    /* Major        */ ['M9', 'Δ9', 'Maj9'],
    /* Minor        */ ['-9', 'm9', 'min9'],

    /********** 11ths **********/
    /* Dominant     */ ['11'],
    /* Major        */ ['M11', 'Δ11', 'Maj11'],
    /* Minor        */ ['-11', 'm11', 'min11'],

    /********** 13ths **********/
    /* Dominant     */ ['13'],
    /* Major        */ ['M13', 'Δ13', 'Maj13'],
    /* Minor        */ ['-13', 'm13', 'min13'],
  ],

  /* ########## COMPLEXITY 4: ALTERED CHORDS ########## */ [ // Talk about a combinatoral explosion, why did I not do this programmatically
    /********** 9ths **********/
    /* Dominant b9  */ ['7 (b9)'],
    /* Dominant #9  */ ['7 (#9)'],
    /* Major b9     */ ['M7 (b9)', 'Δ7 (b9)', 'Maj7 (b9)'],
    /* Major #9     */ ['M7 (#9)', 'Δ7 (#9)', 'Maj7 (#9)'],
    /* Minor b9     */ ['-7 (b9)', 'm7 (b9)', 'min7 (b9)'],

    /********** 11ths **********/
    /* Dominant #11 */ ['7#11', '7 (#11)'],
    /* Major #11    */ ['M7 (#11)', 'Δ7 (#11)', 'Maj7 (#11)'],
    /* Minor #11    */ ['-7 (#11)', 'm7 (#11)', 'min7 (#11)'],

    /********** 13ths **********/
    /* Dominant b13 */ ['7b13', '7 (b13)'],
    /* Major b13    */ ['M7 (b13)', 'Δ7 (b13)', 'Maj7 (b13)'],
    /* Minor b13    */ ['-7 (b13)', 'm7 (b13)', 'min7 (b13)'],
  ],
];
