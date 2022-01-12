import { execSync, exec } from 'child_process';

// Shamelessly stolen from https://github.com/shime/play-sound/blob/master/index.js
// Here's hoping they all work with 1 file argument ^.^'
const PLAYERS = [
  'mplayer',
  'afplay',
  'mpg123',
  'mpg321',
  'play',
  'omxplayer',
  'aplay',
  'cmdmp3',
  'cvlc',
  'powershell'
];

export class Player {
  player = '';

  constructor() {
    for (const possiblePlayer of PLAYERS) {
      if (this.commandExists(possiblePlayer)) {
        this.player = possiblePlayer;
        return;
      }
    }
    throw new Error('No players found :(');
  }

  /**
   * Test whether a shell command exists on this system.
   * @param {string} command 
   * @returns {boolean}
   * @private
   */
  commandExists(command) {
    try {
      execSync(`type ${command} &> /dev/null`);
      return true;
    } catch {
      return false;
    }
  };

  /**
   * Play the file with the given name.
   * @param {string} filename 
   */
  play(filename) {
    exec(`${this.player} ${filename}`);
  }
}