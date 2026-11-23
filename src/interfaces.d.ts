namespace Setting {
  type SettingsToTypesMap = {
    tempo: 'number';
    timeSignature: 'number';
    chordDuration: 'enum';
    lookahead: 'number';
    complexity: 'enum';
    metronome: 'boolean';
    accidentals: 'enum';
  };

  type Name = keyof SettingsToTypesMap;

  type TypeOf<N extends Name> = SettingsToTypesMap[N];

  type ValueTypeOf<N extends Name> = TypesToValuesMap[TypeOf<N>];

  type

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
