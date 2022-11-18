import { COLORS } from './colors.js';
import { getRandomChord } from './getRandomChord.js';
import { SettingsManager } from './settingsManager.js'
import { Player } from './player.js';

/**
 * The core of the app. Draws the interface, handles scheduling future beats, plays the metronome sound. Is there anything it can't do?
 */
export class ChordChartPracticeApp {
  /**
   * Internal state for the app. User-configurable settings are handled by SettingsManager.
   * @private
   */
  state = {
    beat: 0,
    chord: '',
    nextChord: '',

    settingsOpen: false,
  };

  /**
   * Manages the user-configurable settings for the app
   * @private
   * @readonly
   */
  settings = new SettingsManager();

  /**
   * Plays a given sound.
   * @private
   * @readonly
   */
  player = new Player();

  constructor() {
    this.setupKeyboardInput();
    this.mainLoop();
  }

  /**
   * The main loop. Runs on each "beat" to redraw the interface and play the metronome sound.
   * @private
   */
  mainLoop() {
    this.state.beat += 1;
    if (this.state.beat === 1 || this.getProgress() > 1) this.nextPhrase();

    this.doMetronome();
    this.drawInterface();

    // use setTimeout over setInterval so changing the tempo "just works"
    setTimeout(this.mainLoop.bind(this), this.getMSPerBeat());
  }

  /**
   * Setup keyboard input.
   * Adapted from https://stackoverflow.com/a/30687420
   * @private
   */
  setupKeyboardInput() {
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', this.handleKeyboardInput.bind(this));
  }

  /**
   * Handle key presses and stuff.
   * Adapted from https://stackoverflow.com/a/30687420
   * @param {Buffer} key
   * @private
   */
  handleKeyboardInput(key) {
    const keyString = key.toString();
    if (this.state.settingsOpen && this.settings.handleKeyboardInput(keyString)) {
      // noop, input was handled by settingsManager
    } else if (keyString === 's') {
      this.state.settingsOpen = !this.state.settingsOpen;
      this.settings.selectedRow = 0;
    } else {
      process.exit();
    }

    // Redraw the interface immediately so the user believes the feedback is real
    this.drawInterface();
  }

  /**
   * Format the given string as a measure (prepend a pipe and center in 8 spaces)
   * @param {string} str
   * @private
   */
  formatMeasure(str) {
    if (str.length > 7) return `| ${str} `;
    const length = 8 - str.length;
    return `|${' '.repeat(Math.floor(length/2))}${str}${' '.repeat(Math.ceil(length/2))}`;
  }

  /**
   * Get the number of milliseconds in a beat.
   * `setTimeout` isn't actually that precise, but that's okay since we're only ever scheduling 1 event into the future.
   * @private
   */
  getMSPerBeat() { return 60 * 1000 / this.settings.get('tempo'); }

  /**
   * Get the progress in the phrase, as a number 0-1.
   * @private
   */
  getProgress() { return this.state.beat / (this.settings.get('timeSignature') * this.settings.get('barsPerPhrase')); }

  /**
   * Use ANSI color codes to highlight the given string into a progress bar!
   * @param {string} string 
   * @private
   */
  progressBarIfyString(string, progress) {
    const progressLength = Math.round(progress * string.length);
    const progressPart = string.substring(0, progressLength);
    const remainderPart = string.substring(progressLength);
    return `${COLORS.gray(progressPart)}${remainderPart}`;
  }
  
  /**
   * Generate the "chord line" of the CLI: chord-measures progress bar and next chord.
   * @private
   */
  genChordLine() {
    const thisPhraseRaw = `${this.formatMeasure(this.state.chord)}${this.formatMeasure('%').repeat(this.settings.get('barsPerPhrase') - 1)}`;
    const thisPhraseProgressBar = this.progressBarIfyString(thisPhraseRaw, this.getProgress());
    return `${thisPhraseProgressBar}| ${COLORS.dim(this.state.nextChord)} `; // Space on the end because cursor is ugly
  }
  
  /**
   * Stuff that happens at the beginning of each measure (choosing the next chord and setting beat to 0)
   * @private
   */
  nextPhrase() {
    this.state.beat = 1;
    this.state.chord = this.state.nextChord || getRandomChord(this.settings.get('simplifyEnharmonics'), this.settings.get('complexity'));
    this.state.nextChord = getRandomChord(this.settings.get('simplifyEnharmonics'), this.settings.get('complexity'));
  }

  /**
   * Plays the metronome sound. Runs in the "main loop" on each beat.
   * @private
   */
  doMetronome() {
    if (this.settings.get('metronome')) {
      if (this.state.beat % this.settings.get('timeSignature') === 1) {
        this.player.play('resources/high.mp3');
      } else {
        this.player.play('resources/low.mp3');
      }
    }
  }

  /**
   * Draw the interface. Runs in the "main loop" on each beat, or on keyboard input
   * @private
   */
  drawInterface() {
    console.clear();
    if (this.state.settingsOpen) {
      this.settings.drawInterface();
    } else {
      console.log(COLORS.dim('Open Settings: [s]'));
      console.log(COLORS.dim('Press any other key to exit.'));
      console.log('');
    }
    process.stdout.write(this.genChordLine()); // use stdout.write just to keep cursor on this line.
  }
}