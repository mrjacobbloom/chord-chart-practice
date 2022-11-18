namespace Setting {
  type SettingsToTypesMap = {
    tempo: 'number';
    timeSignature: 'number';
    barsPerPhrase: 'number';
    complexity: 'enum';
    metronome: 'boolean';
    simplifyEnharmonics: 'boolean';
  };

  type TypesToValuesMap = {
    'number': number;
    'boolean': boolean;
    'enum': number;
  };

  type Name = keyof SettingsToTypesMap;

  type TypeOf<N extends Name> = SettingsToTypesMap[N];

  type ValueTypeOf<N extends Name> = TypesToValuesMap[TypeOf<N>];

  type Setting<N extends Name> = {
    name: N;
    displayName: string;
    valueSuffix?: SettingsToTypes; // literally just for the `${n}/4`
    type: TypeOf<N>;
    value: ValueTypeOf<N>; // default value is just the initial value of value, lol

    min?: number; max?: number; increment?: number; // number-type only
    enum?: string[]; // enum-type only
  };
}

type Setting<N extends Setting.Name> = Setting.Setting<N>;
