namespace Setting {
  type SettingsToTypesMap = {
    tempo: 'number';
    timeSignature: 'number';
    chordDuration: 'enum';
    lookahead: 'number';
    complexity: 'enum';
    bassNotes: 'boolean';
    metronome: 'enum';
    metronomeDelay: 'number';
    accidentals: 'enum';
  };

  type TypesToValuesMap = {
    boolean: boolean;
    number: number;
    enum: number;
  };

  type Name = keyof SettingsToTypesMap;

  type TypeOf<N extends Name> = SettingsToTypesMap[N];

  type ValueTypeOf<N extends Name> = TypesToValuesMap[TypeOf<N>];

  type Setting =
  | {
    type: 'boolean';
    name: string;
    displayName: string;
    value: boolean; // default value is just the initial value of value
  }
  | {
    type: 'number';
    name: string;
    displayName: string;
    valueSuffix?: string; // literally just for the `${n}/4`
    value: number; // default value is just the initial value of value
    min?: number;
    max?: number;
    increment?: number;
  }
  | {
    type: 'enum';
    name: string;
    displayName: string;
    value: number; // default value is just the initial value of value
    enum: string[];
  }
}

type Setting<N extends Setting.Name> = Setting.Setting<SettingsToTypesMap<N>>;

namespace Cadence {
  type Chord = {
    quality: string;
    family: string;
    symbol: string;
    bassInterval?: Cadence.Interval;
  };

  type Interval = { name: string; semitones: number; };

  type Cadence = {
    /**
     * Number of times this cadence occurred in the iReal data
     */
    frequency: number;
  
    chord1: Cadence.Chord;
    interval1: Cadence.Interval;
    chord2: Cadence.Chord;
    interval2: Cadence.Interval;
    chord3: Cadence.Chord;
  };
}

/**
 * Represents the motion and qualities of any 3 neighboring chords in the iReal 1300
 */
type Cadence = Cadence.Cadence;
