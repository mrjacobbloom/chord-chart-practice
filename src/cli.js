import { COLORS } from './colors.js';
import { getRandomChord } from './getRandomChord.js';
import { Player } from './player.js';

/**
 * The core of the app. Draws the interface, handles scheduling future beats, plays the metronome sound. Is there anything it can't do?
 */
export class CLI {
  /**
   * State for the app.
   * @private
   */
  state = {
    // The user-configurable options
    tempo: 120,
    timeSignature: 4,
    barsPerPhrase: 2,
    metronome: true,
    simplifyEnharmonics: false,
  
    // Other state
    beat: -2, // Incremented at the start of the main loop, but also.... you know what, just don't worry about it ok
    chord: '',
    nextChord: '',
  }

  /**
   * Plays a given sound.
   * @private
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
    if (this.state.beat === -1 || this.getProgress() > 1) this.nextPhrase();

    this.doMetronome();
    this.drawInterface();

    // use setTimeout over setInterval so changing the tempo "just works"
    setTimeout(this.mainLoop.bind(this), this.getMSPerBeat());
  }

  /**
   * Setup keyboard input.
   * @private
   */
  setupKeyboardInput() {
    // Adapted from https://stackoverflow.com/a/30687420
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', this.handleKeyboardInput.bind(this));
  }

  /**
   * Handle key presses and stuff.
   * @param {Buffer} key 
   */
  handleKeyboardInput(key){
    const keyString = key.toString();
    switch (keyString) {
      case '\u001B\u005B\u0041': { // up
        this.state.tempo += 5;
        break;
      }
      case '\u001B\u005B\u0042': { // down
        this.state.tempo = Math.max(this.state.tempo - 5, 20);
        break;
      }
      case '\u001B\u005B\u0043': { // right
        this.state.barsPerPhrase += 1;
        break;
      }
      case '\u001B\u005B\u0044': { // left
        this.state.barsPerPhrase = Math.max(this.state.barsPerPhrase - 1, 1);
        break;
      }
      case 'm': {
        this.state.metronome = !this.state.metronome;
        break;
      }
      case 'e': {
        this.state.simplifyEnharmonics = !this.state.simplifyEnharmonics;
        break;
      }
      default: {
        const asNumber = Number(keyString);
        if (asNumber) {
          this.state.timeSignature = asNumber;

        } else {
          process.exit();
        }
      }
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
    const length = 8 - str.length;
    return `|${' '.repeat(Math.floor(length/2))}${str}${' '.repeat(Math.ceil(length/2))}`;
  }

  /**
   * Get the number of milliseconds in a beat.
   * `setTimeout` isn't actually that precise, but that's okay since we're only ever scheduling 1 event into the future.
   * @private
   */
  getMSPerBeat() { return 60 * 1000 / this.state.tempo; }

  /**
   * Get the progress in the phrase, as a number 0-1.
   * @private
   */
  getProgress() { return (this.state.beat + 1) / (this.state.timeSignature * this.state.barsPerPhrase); }

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
    const thisPhraseRaw = `${this.formatMeasure(this.state.chord)}${this.formatMeasure('%').repeat(this.state.barsPerPhrase - 1)}`;
    const thisPhraseProgressBar = this.progressBarIfyString(thisPhraseRaw, this.getProgress());
    return `${thisPhraseProgressBar}| ${COLORS.dim(this.state.nextChord)} `; // Space on the end because cursor is ugly
  }
  
  /**
   * Stuff that happens at the beginning of each measure (choosing the next chord and setting beat to 0)
   * @private
   */
  nextPhrase() {
    this.state.beat = 0;
    this.state.chord = this.state.nextChord || getRandomChord(this.state.simplifyEnharmonics);
    this.state.nextChord = getRandomChord(this.state.simplifyEnharmonics);
  }

  /**
   * Plays the metronome sound. Runs in the "main loop" on each beat.
   * @private
   */
  doMetronome() {
    if (this.state.metronome) {
      if (this.state.beat % this.state.timeSignature === 0) {
        this.player.play('resources/high.mp3');
      } else {
        this.player.play('resources/low.mp3');
      }
    }
  }

  /**
   * Draw the interface. Runs in the "main loop" on each beat, or when a setting changes.
   * @private
   */
  drawInterface() {
    console.clear();
    console.log(`Tempo: ${this.state.tempo} ${COLORS.dim('-- change: [↑] & [↓]')}`);
    console.log(`Time Signature: ${this.state.timeSignature}/4 ${COLORS.dim('-- change: [1-9]')}`);
    console.log(`Bars per Phrase: ${this.state.barsPerPhrase} ${COLORS.dim('-- change: [←] & [→]')}`);
    console.log(`Metronome: ${this.state.metronome ? 'ON' : 'OFF'} ${COLORS.dim('-- toggle: [m]')}`);
    console.log(`Simplify (Cb→B, etc): ${this.state.simplifyEnharmonics ? 'ON' : 'OFF'} ${COLORS.dim('-- toggle: [e]')}`);
    console.log('Press any other key to exit.');
    console.log('');
    process.stdout.write(this.genChordLine()); // use stdout.write just to keep cursor on this line.
  }
}