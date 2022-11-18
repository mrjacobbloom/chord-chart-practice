import { COLORS } from './colors.js';

/**
 * @typedef {Setting.TypeOf<'tempo'>} x
 */

/**
 * Manages the user-configurable settings for the app
 */
export class SettingsManager {
  /**
   * @type {Setting<Setting.Name>[]}
   * @private
   */
   settings = [
    { name: 'tempo', displayName: 'Tempo', type: 'number', value: 120, min: 20, increment: 5 },
    { name: 'timeSignature', displayName: 'Time Signature', type: 'number', value: 4, min: 1, max: 12, valueSuffix: '/4' },
    { name: 'barsPerPhrase', displayName: 'Bars per Phrase', type: 'number', value: 2, min: 1 },
    { name: 'complexity', displayName: 'Complexity', type: 'enum', value: 3, enum: ['Triads & Suspensions', '7ths', 'Chord Extensions', 'Altered Chords'] },
    { name: 'metronome', displayName: 'Metronome', type: 'boolean', value: true },
    { name: 'simplifyEnharmonics', displayName: 'Simplify Enharmonics (Cb→B, etc)', type: 'boolean', value: false },
  ];

  selectedRow = 0;

  /**
   * Get a given setting
   * @template {Setting.Name} N
   * @param {N} name 
   * @returns {Setting.ValueTypeOf<N>}
   * @public
   */
  get(name) {
    const setting = this.settings.find(s => s.name === name);
    if (!setting) {
      throw new Error(`Setting "${name}" not found!`);
    }
    return /** @type {any} */ (setting.value);
  }

  /**
   * Handle key presses and stuff.
   * Adapted from https://stackoverflow.com/a/30687420
   * @param {string} keyString 
   * @returns {boolean} whether the input was caught by settingsManager or should be handled by the parent app
   * @public
   */
  handleKeyboardInput(keyString) {
    const setting = this.settings[this.selectedRow];
    switch (keyString) {
      case '\u001B\u005B\u0041': { // up
        this.selectedRow--;
        if (this.selectedRow < 0) this.selectedRow = this.settings.length - 1;
        break;
      }
      case '\u001B\u005B\u0042': { // down
        this.selectedRow++;
        if (this.selectedRow > this.settings.length - 1) this.selectedRow = 0;
        break;
      }
      case '\u001B\u005B\u0043': { // right
        if (setting.type === 'boolean') {
          setting.value = !setting.value
        } else if (setting.type === 'number') {
          setting.value = Math.min((+setting.value) + (setting.increment ?? 1), setting.max ?? Infinity);
        } else if (setting.type === 'enum') {
          setting.value = /** @type {any} */ (setting.value) + 1;
          if (setting.value > setting.enum.length - 1) setting.value = 0;
        }
        break;
      }
      case '\u001B\u005B\u0044': { // left
        if (setting.type === 'boolean') {
          setting.value = !setting.value
        } else if (setting.type === 'number') {
          setting.value = Math.max((+setting.value) - (setting.increment ?? 1), setting.min ?? -Infinity);
        } else if (setting.type === 'enum') {
          setting.value = /** @type {any} */ (setting.value) - 1;
          if (setting.value < 0) setting.value = setting.enum.length - 1;
        }
        break;
      }
      default: {
        return false;
      }
    }
    return true;
  }

  drawInterface() {
    console.log(COLORS.dim('Close Settings: [s] - Move: [↑ ↓] - Change: [← →]'));
    console.log(COLORS.dim('Press any other key to exit.'));
    console.log('');
    for (let i = 0; i < this.settings.length; i++) {
      const setting = this.settings[i];
      let prettyValue = String(setting.value);
      if (setting.type === 'boolean') prettyValue = setting.value ? 'ON' : 'OFF';
      if (setting.type === 'enum') prettyValue = `${setting.value} (${setting.enum[/** @type {any} */ (setting.value)]})`;
      if (setting.valueSuffix) prettyValue += setting.valueSuffix;
      const line = `${setting.displayName}: ${prettyValue}`;
      console.log(i === this.selectedRow ? COLORS.gray(line) : line)
    }
    console.log('');
  }
}