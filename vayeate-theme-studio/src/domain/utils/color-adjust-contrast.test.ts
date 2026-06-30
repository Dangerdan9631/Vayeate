import { describe, expect, it } from 'vitest';
import { adjustColorToMeetContrast } from './color-adjust-contrast';
import { contrastRatio } from './color-wcag';
import { buildScopeColorMapFromInputs } from './scope-resolver';

describe('contrast color adjustment', () => {
  it.each([
    ['greaterThan', '#777777', '#000000', 7, (ratio: number) => ratio >= 6.99],
    ['lessThan', '#000000', '#ffffff', 3, (ratio: number) => ratio <= 3.01],
    ['equalTo', '#000000', '#ffffff', 3, (ratio: number) => Math.abs(ratio - 3) <= 0.05],
  ] as const)('changes the output color to satisfy %s constraints', (comparisonMethod, color, source, value, isValid) => {
    const adjusted = adjustColorToMeetContrast(color, source, {
      comparisonMethod,
      value,
    });

    expect(adjusted).not.toBe(color);
    expect(isValid(contrastRatio(adjusted, source))).toBe(true);
  });

  it('applies min and max bounds against the configured source color', () => {
    const source = '#ffffff';
    const adjusted = adjustColorToMeetContrast('#000000', source, {
      comparisonMethod: 'greaterThan',
      value: 1,
      max: 3,
    });

    expect(contrastRatio(adjusted, source)).toBeLessThanOrEqual(3.01);
  });

  it('preserves the assigned color alpha after adjustment', () => {
    const adjusted = adjustColorToMeetContrast('#00000080', '#ffffff', {
      comparisonMethod: 'lessThan',
      value: 3,
    });

    expect(adjusted).toMatch(/^#[0-9a-f]{8}$/);
    expect(adjusted.endsWith('80')).toBe(true);
    expect(contrastRatio(adjusted, '#ffffff')).toBeLessThanOrEqual(3.01);
  });

  it('adjusts each mapped color against its contrast variable comparison source', () => {
    const scopeMap = buildScopeColorMapFromInputs({
      mappings: [
        {
          tokenKey: 'token.onDark',
          colorVariableRef: 'accent',
          contrastVariableRef: 'againstDark',
        },
        {
          tokenKey: 'token.onLight',
          colorVariableRef: 'accent',
          contrastVariableRef: 'againstLight',
        },
      ],
      colorAssignments: [
        { colorRef: 'accent', dark: '#777777cc', light: null, useDarkForLight: true },
        { colorRef: 'darkSource', dark: '#000000', light: null, useDarkForLight: true },
        { colorRef: 'lightSource', dark: '#ffffff', light: null, useDarkForLight: true },
      ],
      contrastAssignments: [
        {
          contrastVariableRef: 'againstDark',
          dark: { comparisonMethod: 'greaterThan', value: 7, min: null, max: null },
          light: null,
          useDarkForLight: true,
        },
        {
          contrastVariableRef: 'againstLight',
          dark: { comparisonMethod: 'greaterThan', value: 7, min: null, max: null },
          light: null,
          useDarkForLight: true,
        },
      ],
      contrastVariables: [
        { key: 'againstDark', comparisonSourceRef: 'darkSource' },
        { key: 'againstLight', comparisonSourceRef: 'lightSource' },
      ],
    });

    const onDark = scopeMap.entries.find(
      (entry) => entry.colorVariableRef === 'accent' && entry.contrastVariableRef === 'againstDark',
    );
    const onLight = scopeMap.entries.find(
      (entry) => entry.colorVariableRef === 'accent' && entry.contrastVariableRef === 'againstLight',
    );

    expect(onDark?.darkColor).toMatch(/cc$/);
    expect(onLight?.darkColor).toMatch(/cc$/);
    expect(onDark?.darkColor).not.toBe(onLight?.darkColor);
    expect(contrastRatio(onDark!.darkColor!, '#000000')).toBeGreaterThanOrEqual(6.99);
    expect(contrastRatio(onLight!.darkColor!, '#ffffff')).toBeGreaterThanOrEqual(6.99);
  });
});
