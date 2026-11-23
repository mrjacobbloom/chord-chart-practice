import { COLORS } from './colors.js';
import { getRandomChord } from './getRandomChord.js';
import { SettingsManager } from './settingsManager.js'
import { Player } from './player.js';

const MEASURE_CHAR_LENGTH = 10;

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

    /**
     * Array of measures, and each measure is an array of chord strings
     * @type {string[][]}
     * */
    measures: [],

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
   * Format the given measure (chords array) as a string (prepend a pipe and center in 8 spaces)
   * @param {string[]} measure
   * @private
   */
  formatMeasure(measure) {
    const chordsStr = measure.join(' ');
    const length = Math.max(1, MEASURE_CHAR_LENGTH - chordsStr.length - 1)
    return `| ${chordsStr}${' '.repeat(length)}`;
  }

  /**
   * Get the number of milliseconds in a beat.
   * `setTimeout` isn't actually that precise, but that's okay since we're only ever scheduling 1 event into the future.
   * @private
   */
  getMSPerBeat() { return 60 * 1000 / this.settings.get('tempo'); }

  /**
   * Get the progress in the measure, as a number 0-1.
   * @private
   */
  getProgress() { return this.state.beat / this.settings.get('timeSignature'); }

  /**
   * Use ANSI color codes to highlight the given string into a progress bar!
   * @param {string} string
   * @param {number} progress Progress in the measure, as a number 0-1
   * @private
   */
  progressBarIfyString(string, progress) {
    const progressLength = Math.round(progress * string.length);
    const progressPart = string.substring(0, progressLength);
    const remainderPart = string.substring(progressLength);
    return `${COLORS.gray(progressPart)}${remainderPart}`;
  }
  
  /**
   * Generate the "chord line" of the CLI
   * @private
   */
  genChordLine() {
    const [currentMeasure, ...futureMeasures] = this.state.measures;
    const currentMeasureProgressBar = this.progressBarIfyString(this.formatMeasure(currentMeasure), this.getProgress());
    const futureMeasuresRendered = futureMeasures.map(m => this.formatMeasure(m)).join('').substring(1); // cut off first measure's leading pipe
    return `${currentMeasureProgressBar}|${COLORS.dim(futureMeasuresRendered)} `; // Space on the end because cursor is ugly
  }
  
  /**
   * Stuff that happens at the beginning of each measure (choosing the next chord and setting beat to 0)
   * @private
   */
  nextPhrase() {
    this.state.beat = 1;
    this.state.measures.splice(0, 1); // pop-front the previous measure
    while(this.state.measures.length < this.settings.get('lookahead') + 1) {
      if (this.settings.get('chordDuration') === 0) { // 1 beat
        const measure = [];
        for (let i = 0; i < this.settings.get('timeSignature'); i++) {
          measure.push(getRandomChord(this.settings.get('complexity'), this.settings.get('accidentals')));
        }
        this.state.measures.push(measure)
      } else if (this.settings.get('chordDuration') === 1) { // 2 beats
        const measure = [];
        for (let i = 0; i < this.settings.get('timeSignature'); i += 2) {
          measure.push(getRandomChord(this.settings.get('complexity'), this.settings.get('accidentals')));
        }
        this.state.measures.push(measure)
      } else if (this.settings.get('chordDuration') === 2) { // 1 measure
        this.state.measures.push([getRandomChord(this.settings.get('complexity'), this.settings.get('accidentals'))]);
      } else if (this.settings.get('chordDuration') === 3) { // 2 measures
        this.state.measures.push([getRandomChord(this.settings.get('complexity'), this.settings.get('accidentals'))]);
        this.state.measures.push(['%']);
      }
    }
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