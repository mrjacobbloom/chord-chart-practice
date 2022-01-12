import { KEYS, ACCIDENTALS, ENHARMONIC, QUALITIES } from './theoryConstants.js';

/**
 * Pick a random item from an array.
 *
 * @type {<T>(arr: T[]) => T}
 */
const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

/**
 * Generate a random chord string.
 * @param {boolean} simplifyEnharmonics If true, don't generate tonics like "Fb" that have a simpler enharmonic equivalent.
 * @returns {string} A random chord as a string.
 */
export const getRandomChord = (simplifyEnharmonics) => {
  /** @type {string} */ let tonic;
  do {
    tonic = `${pickRandom(KEYS)}${pickRandom(ACCIDENTALS)}`
  } while(simplifyEnharmonics && ENHARMONIC.includes(tonic)) // yay for nondeterminism!
  const quality = pickRandom(pickRandom(QUALITIES));
  return `${tonic}${quality}`;
};
