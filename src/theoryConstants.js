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
 * Automatically generate the basic aliases for major and minor qualities
 * @param {string} orig Original quality using "Maj" or "min"
 * @returns {string[]}
 */
const alias = (orig) => [orig, orig.replace('min', 'm').replace('Maj', 'M'), orig.replace('min', '-').replace('Maj', 'Δ')]

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
    /* Major        */ ['', 'Maj', 'M'],
    /* Minor        */ alias('min'),
    /* Diminished   */ ['dim', '°'],
    /* Augmented    */ ['aug', '+'],

    /********** Suspensions / NCTs **********/
    /* Major        */ ['sus2'], ['sus4'], ['6'],
    /* Minor        */ ['-sus2'], ['-sus4'], alias('min6'),
  ],

  /* ########## COMPLEXITY 2: 7THS ########## */ [
    /* Dominant     */ ['7'],
    /* Major        */ alias('Maj7'),
    /* Minor        */ alias('min7'),
    /* Fully-Diminished */ ['dim7', '°7'],
    /* Half-Diminished  */ ['ø7', 'm7b5', ...alias('min7 (b5)')],
  ],

  /* ########## COMPLEXITY 3: CHORD EXTENSIONS ########## */ [
    /********** 9ths **********/
    /* Dominant     */ ['9'],
    /* Major        */ alias('Maj9'),
    /* Minor        */ alias('min9'),

    /********** 11ths **********/
    /* Dominant     */ ['11'],
    /* Major        */ alias('Maj11'),
    /* Minor        */ alias('min11'),

    /********** 13ths **********/
    /* Dominant     */ ['13'],
    /* Major        */ alias('Maj13'),
    /* Minor        */ alias('min13'),
  ],

  /* ########## COMPLEXITY 4: ALTERED CHORDS ########## */ [ // Talk about a combinatoral explosion
    /********** 9ths **********/
    /* Dominant b9  */ ['7 (b9)'],
    /* Dominant #9  */ ['7 (#9)'],
    /* Major b9     */ alias('Maj7 (b9)'),
    /* Major #9     */ alias('Maj7 (#9)'),
    /* Minor b9     */ alias('min7 (b9)'),

    /********** 11ths **********/
    /* Dominant #11 */ ['7#11', '7 (#11)'],
    /* Major #11    */ alias('Maj7 (#11)'),
    /* Minor #11    */ alias('min7 (#11)'),

    /********** 13ths **********/
    /* Dominant b13 */ ['7b13', '7 (b13)'],
    /* Major b13    */ alias('Maj7 (b13)'),
    /* Minor b13    */ alias('min7 (b13)'),
  ],
];
