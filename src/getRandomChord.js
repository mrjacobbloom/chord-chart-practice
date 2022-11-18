import { KEYS, ACCIDENTALS, ENHARMONIC, QUALITIES } from './theoryConstants.js';

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
 * @param {boolean} simplifyEnharmonics If true, don't generate tonics like "Fb" that have a simpler enharmonic equivalent.
 * @param {number} complexity Number from 0-3 defining chord complexity
 * @returns {string} A random chord as a string.
 */
export const getRandomChord = (simplifyEnharmonics, complexity) => {
  /** @type {string} */ let tonic;
  do {
    tonic = `${pickRandom(KEYS)}${pickRandom(ACCIDENTALS)}`
  } while(simplifyEnharmonics && ENHARMONIC.includes(tonic)) // yay for nondeterminism!
  const quality = pickRandom(pickRandom(getQualitiesAtComplexity(complexity)));
  return `${tonic}${quality}`;
};
