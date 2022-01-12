const RESET = '\u001b[0m';

/**
 * Generate a function to generate terminal colors.
 * @param {string} start The ANSI character code to begin the sequence.
 * @param {string=} reset The ANSI character code to reset the effect.
 * @returns {(str: string) => string}
 */
const genColorFunction = (start, reset = RESET) => ((str) => `${start}${str}${reset}`);

/**
 * An object with color-functions on it. Use it to turn text different colors (or do other effects) in the terminal.
 */
export const COLORS = {
  dim: genColorFunction('\u001B[2m', '\u001B[22m'),
  gray: genColorFunction('\u001b[47;1m'),
};