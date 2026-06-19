import { describe, expect, it, vi } from 'vitest';
import * as scheduler from '../core/scheduler';
import type { GeneratedTheme } from './theme-generator';
import { stringifyTheme, stringifyThemeAsync } from './stringify-theme';

const sampleTheme: GeneratedTheme = {
  name: 'Baseline',
  type: 'dark',
  semanticHighlighting: true,
  colors: { 'editor.foreground': '#112233' },
  tokenColors: [],
  semanticTokenColors: {},
};

describe('stringifyThemeAsync', () => {
  it('keeps generated exports pretty with a trailing newline', () => {
    const result = stringifyTheme(sampleTheme);

    expect(result).toContain('\n    "name": "Baseline"');
    expect(result.endsWith('\n')).toBe(true);
  });

  it('matches synchronous serialization output', async () => {
    const sync = stringifyTheme(sampleTheme);
    const asyncResult = await stringifyThemeAsync(sampleTheme);
    expect(asyncResult).toBe(sync);
  });

  it('yields before serializing', async () => {
    const yieldSpy = vi.spyOn(scheduler, 'yieldToEventLoop').mockResolvedValue();
    await stringifyThemeAsync(sampleTheme);
    expect(yieldSpy).toHaveBeenCalledTimes(1);
    yieldSpy.mockRestore();
  });
});
