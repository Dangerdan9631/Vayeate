import { describe, it, expect } from 'vitest';
import {
  contrastRatio,
  adjustColorToMeetContrast,
  luminance,
  normalizeHex,
} from './color';

describe('normalizeHex', () => {
  it('expands 3-digit hex to 6', () => {
    expect(normalizeHex('#f00')).toBe('#ff0000');
    expect(normalizeHex('#abc')).toBe('#aabbcc');
  });
  it('keeps 6-digit hex', () => {
    expect(normalizeHex('#ff0000')).toBe('#ff0000');
  });
  it('strips alpha from 8-digit', () => {
    expect(normalizeHex('#ff0000ff')).toBe('#ff0000');
  });
  it('throws on invalid', () => {
    expect(() => normalizeHex('ff0000')).toThrow();
    expect(() => normalizeHex('#gg')).toThrow();
  });
});

describe('contrastRatio', () => {
  it('returns 21 for black on white', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 1);
    expect(contrastRatio('#ffffff', '#000000')).toBeCloseTo(21, 1);
  });
  it('returns 1 for same color', () => {
    expect(contrastRatio('#808080', '#808080')).toBe(1);
  });
  it('returns value between 1 and 21 for gray pairs', () => {
    const r = contrastRatio('#444444', '#cccccc');
    expect(r).toBeGreaterThan(1);
    expect(r).toBeLessThanOrEqual(21);
  });
});

describe('luminance', () => {
  it('black is 0', () => {
    expect(luminance('#000000')).toBe(0);
  });
  it('white is 1', () => {
    expect(luminance('#ffffff')).toBe(1);
  });
});

describe('adjustColorToMeetContrast', () => {
  const darkBg = '#1e1e1e';
  const lightBg = '#ffffff';

  it('greaterThan: adjusts token to meet minimum contrast', () => {
    const token = '#1e1e1e';
    const result = adjustColorToMeetContrast(token, darkBg, {
      comparisonMethod: 'greaterThan',
      value: 4.5,
    });
    const ratio = contrastRatio(result, darkBg);
    expect(ratio).toBeGreaterThanOrEqual(4.5);
    expect(result).not.toBe(token);
  });

  it('greaterThan: leaves token unchanged when already above value', () => {
    const token = '#ffffff';
    const result = adjustColorToMeetContrast(token, darkBg, {
      comparisonMethod: 'greaterThan',
      value: 4.5,
    });
    expect(contrastRatio(result, darkBg)).toBeGreaterThanOrEqual(4.5);
    expect(result.toLowerCase()).toBe(token.toLowerCase());
  });

  it('lessThan: adjusts token so contrast is at or below value', () => {
    const token = '#ffffff';
    const result = adjustColorToMeetContrast(token, darkBg, {
      comparisonMethod: 'lessThan',
      value: 3,
    });
    const ratio = contrastRatio(result, darkBg);
    expect(ratio).toBeLessThanOrEqual(3.5);
    expect(ratio).toBeGreaterThanOrEqual(1);
  });

  it('equalTo: adjusts token toward target contrast', () => {
    const token = '#888888';
    const result = adjustColorToMeetContrast(token, lightBg, {
      comparisonMethod: 'equalTo',
      value: 4.5,
    });
    const ratio = contrastRatio(result, lightBg);
    expect(ratio).toBeGreaterThanOrEqual(4);
    expect(ratio).toBeLessThanOrEqual(5);
  });

  it('greaterThan with min/max: clamps contrast vs black to [min, max]', () => {
    const token = '#333333';
    const result = adjustColorToMeetContrast(token, darkBg, {
      comparisonMethod: 'greaterThan',
      value: 4.5,
      min: 3,
      max: 7,
    });
    expect(contrastRatio(result, darkBg)).toBeGreaterThanOrEqual(4.5);
    const ratioVsBlack = contrastRatio(result, '#000000');
    expect(ratioVsBlack).toBeGreaterThanOrEqual(2.9);
    expect(ratioVsBlack).toBeLessThanOrEqual(7.5);
  });

  it('lessThan with min/max: clamps contrast vs black to [min, max]', () => {
    const token = '#000000';
    const result = adjustColorToMeetContrast(token, darkBg, {
      comparisonMethod: 'lessThan',
      value: 5,
      min: 2,
      max: 4,
    });
    expect(contrastRatio(result, darkBg)).toBeLessThanOrEqual(5.5);
    const ratioVsBlack = contrastRatio(result, '#000000');
    expect(ratioVsBlack).toBeGreaterThanOrEqual(1.9);
    expect(ratioVsBlack).toBeLessThanOrEqual(4.5);
  });

  it('equalTo with min/max: clamps contrast vs black to [min, max]', () => {
    const token = '#888888';
    const result = adjustColorToMeetContrast(token, lightBg, {
      comparisonMethod: 'equalTo',
      value: 10,
      min: 3,
      max: 5,
    });
    const ratioVsBlack = contrastRatio(result, '#000000');
    expect(ratioVsBlack).toBeGreaterThanOrEqual(2.9);
    expect(ratioVsBlack).toBeLessThanOrEqual(5.5);
  });
});
