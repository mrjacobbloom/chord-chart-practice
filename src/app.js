import { COLORS } from './colors.js';
import { predictNextChord } from './getRandomChord.js';
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
    /**
     * How many beats we are into the PHRASE, which is defined as 1 or more measures
     */
    beat: 0,

    /**
     * current and upcoming chord strings
     * @type {string[]}
     * */
    chords: ['CMaj7'],

    /**
     * Last 2 chords used
     */
    history: ['D-7', 'G7'],

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
    if (this.state.beat === 1 || this.getPhraseProgress() > 1) this.nextPhrase();

    this.drawInterface();

    // use setTimeout over setInterval so changing the tempo "just works"
    const nextBeat = this.state.beat + 1; // freeze the beat to sidestep timing issues
    setTimeout(() => this.doMetronome(nextBeat), this.getMSPerBeat() + this.settings.get('metronomeDelay'))
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
   * Pad the given measure (chords array) as a string (centered in 10 spaces)
   * @param {string[]} measure
   * @private
   */
  padMeasure(measure) {
    const chordsStr = measure.join(' ');
    const length = Math.max(1, MEASURE_CHAR_LENGTH - chordsStr.length - 1)
    return ` ${chordsStr}${' '.repeat(length)}`;
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
  getMeasureProgress() {
    const p = (this.state.beat % this.settings.get('timeSignature')) / this.settings.get('timeSignature');
    return p === 0 ? 1 : p;
  }

  /**
   * Get the progress in the phrase (1 or more measures), as a number 0-1.
   * @private
   */
  getPhraseProgress() { return this.state.beat / (this.settings.get('timeSignature') * this.getMeasuresPerPhrase()); }

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
    const measures = this.getMeasures();
    if (this.state.beat > this.settings.get('timeSignature')) measures.splice(0, 1);
    const [currentMeasure, ...futureMeasures] = measures;
    const currentMeasureProgressBar = this.progressBarIfyString(this.padMeasure(currentMeasure), this.getMeasureProgress());
    const futureMeasuresRendered = futureMeasures.map(m => this.padMeasure(m)).join('|');
    return `|${currentMeasureProgressBar}|${COLORS.dim(futureMeasuresRendered)} `; // Space on the end because cursor is ugly
  }

  /**
   * Get the number of chords per measure
   * @private
   * @returns {number}
   */
  getChordsPerMeasure() {
    if (this.settings.get('chordDuration') === 0) { // 1 beat
      return this.settings.get('timeSignature');
    } else if (this.settings.get('chordDuration') === 1) { // 2 beats
      return Math.floor(this.settings.get('timeSignature') / 2)
    } else if (this.settings.get('chordDuration') === 2) { // 1 measure
      return 1;
    } else { // 2 measures
      return 0.5;
    }
  }

  getMeasuresPerPhrase() {
    return this.settings.get('chordDuration') === 3 ? 2 : 1;
  }

  getChordsPerPhrase() {
    return this.getChordsPerMeasure() * this.getMeasuresPerPhrase();
  }

  /**
   * Divide state.chords into measure arrays, where each one is an array of one or more chord strings (can be `%` for "repeat the last chord")
   * @private
   */
  getMeasures() {
    /** @type {string[][]} */ const measures = [];

    const chordsPerMeasure = this.getChordsPerMeasure();
    /** @type {string[]} */ let measure = [];
    for (const chord of this.state.chords) {
      measure.push(chord);
      if (measure.length >= chordsPerMeasure) {
        measures.push(measure);
        measure = [];
      }

      if (chordsPerMeasure < 1) {
        for(let i = chordsPerMeasure; i < 1; i += chordsPerMeasure) {
          measures.push(['%']);
        }
      }
    }
    return measures;
  }
  
  /**
   * Stuff that happens at the beginning of each phrase (choosing the next chords and setting beat to 0)
   * @private
   */
  nextPhrase() {
    this.state.beat = 1;
    this.state.history = [this.state.history[1], this.state.chords[0]];
    const deletedChords = this.state.chords.splice(0, this.getChordsPerPhrase()); // pop-front the previous phrase
    let prev2 = [...this.state.history, ...deletedChords, ...this.state.chords].slice(-2);
    while(this.state.chords.length < this.getChordsPerPhrase() * (this.settings.get('lookahead') + 1)) {
      const nextChord = predictNextChord({
        chord1String: prev2[0],
        chord2String: prev2[1],
        complexity: this.settings.get('complexity'),
        bassNotes: this.settings.get('bassNotes'),
        accidentals: this.settings.get('accidentals')
      });
      this.state.chords.push(nextChord);
      prev2 = [prev2[1], nextChord];
    }
  }

  /**
   * Plays the metronome sound. Called from the "main loop" on each beat.
   * @param {number} beat
   * @private
   */
  doMetronome(beat) {
    beat = beat % this.settings.get('timeSignature');
    if (this.settings.get('metronome') !== 0) {
      if (beat === 1) {
        this.player.play('resources/high2.mp3');
      } else if (this.settings.get('metronome') === 2 && beat % 2 === 1) {
        this.player.play('resources/low2.mp3');
      } else if (this.settings.get('metronome') === 3) {
        this.player.play('resources/low2.mp3');
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