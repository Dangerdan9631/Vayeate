import { describe, expect, it } from 'vitest';
import {
  areScopeColorMapInputsEqual,
  buildScopeColorMap,
  buildScopeColorMapFromInputs,
  hashScopeColorMapInputs,
  selectScopeColorMapInputs,
} from './scope-resolver';

describe('selectScopeColorMapInputs', () => {
  const mappings = [
    {
      token: { key: 'keyword', type: 'textmate token' as const },
      colorVariableRef: 'fg',
      contrastVariableRef: null,
      groupRef: null,
    },
  ];
  const colorAssignments = [
    {
      colorRef: 'fg',
      dark: { value: '#111111' },
      light: { value: '#eeeeee' },
      useDarkForLight: false,
    },
  ];

  it('produces equal hashes for value-equal inputs with different array references', () => {
    const inputsA = selectScopeColorMapInputs(mappings, colorAssignments, [], []);
    const inputsB = selectScopeColorMapInputs(
      [...mappings],
      colorAssignments.map((a) => ({ ...a, dark: { ...a.dark! }, light: { ...a.light! } })),
      [],
      [],
    );

    expect(areScopeColorMapInputsEqual(inputsA, inputsB)).toBe(true);
    expect(hashScopeColorMapInputs(inputsA)).toBe(hashScopeColorMapInputs(inputsB));
  });

  it('changes hash when an assignment value changes', () => {
    const before = selectScopeColorMapInputs(mappings, colorAssignments, [], []);
    const after = selectScopeColorMapInputs(
      mappings,
      [{ ...colorAssignments[0], dark: { value: '#222222' } }],
      [],
      [],
    );

    expect(areScopeColorMapInputsEqual(before, after)).toBe(false);
    expect(buildScopeColorMap(mappings, colorAssignments, [], []).entries[0].darkColor).toBe('#111111');
    expect(
      buildScopeColorMap(
        mappings,
        [{ ...colorAssignments[0], dark: { value: '#222222' } }],
        [],
        [],
      ).entries[0].darkColor,
    ).toBe('#222222');
  });

  it('buildScopeColorMapFromInputs matches buildScopeColorMap for the same inputs', () => {
    const inputs = selectScopeColorMapInputs(mappings, colorAssignments, [], []);
    expect(buildScopeColorMapFromInputs(inputs).entries[0].darkColor).toBe(
      buildScopeColorMap(mappings, colorAssignments, [], []).entries[0].darkColor,
    );
  });

  it('omits ignored mappings from scope map inputs and resolution', () => {
    const ignoredMappings = [
      { ...mappings[0], ignored: true },
    ];

    const inputs = selectScopeColorMapInputs(ignoredMappings, colorAssignments, [], []);

    expect(inputs.mappings).toEqual([]);
    expect(buildScopeColorMap(ignoredMappings, colorAssignments, [], []).entries).toEqual([]);
  });
});
