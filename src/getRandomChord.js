import { KEYS, ACCIDENTALS, ACCIDENTALS_WITH_DOUBLES, ENHARMONIC, QUALITIES } from './theoryConstants.js';

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
 * Generate a random chord string.
 * @param {number} complexity Number from 0-3 defining chord complexity
 * @param {number} accidentals Number from 0-3 defining accidental complexity
 * @returns {string} A random chord as a string.
 */
export const getRandomChord = (complexity, accidentals) => {
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
  const quality = pickRandom(pickRandom(getQualitiesAtComplexity(complexity)));
  return `${tonic}${quality}`;
};
