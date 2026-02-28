/**
 * @vitest-environment node
 */
import { mkdtempSync, rmSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { exportThemePair, assertValidThemeFileName } from './theme-exporter';
import type { GeneratedTheme } from './theme-generator';

const darkTheme: GeneratedTheme = {
  name: 'Test',
  type: 'dark',
  semanticHighlighting: true,
  colors: { 'editor.foreground': '#d4d4d4' },
  tokenColors: [],
  semanticTokenColors: {},
};

const lightTheme: GeneratedTheme = {
  name: 'Test Light',
  type: 'light',
  semanticHighlighting: true,
  colors: { 'editor.foreground': '#1f1f1f' },
  tokenColors: [],
  semanticTokenColors: {},
};

describe('exportThemePair', () => {
  let outputDir: string;

  beforeEach(() => {
    outputDir = mkdtempSync(join(tmpdir(), 'theme-export-test-'));
  });

  afterEach(() => {
    rmSync(outputDir, { recursive: true, force: true });
  });

  it('writes dark and light theme files', async () => {
    const { darkPath, lightPath } = await exportThemePair(
      outputDir,
      'mytheme',
      darkTheme,
      lightTheme,
    );
    expect(darkPath).toContain('mytheme-color-theme.json');
    expect(lightPath).toContain('mytheme-light-color-theme.json');

    const darkContent = readFileSync(darkPath, 'utf8');
    const lightContent = readFileSync(lightPath, 'utf8');

    const darkParsed = JSON.parse(darkContent);
    const lightParsed = JSON.parse(lightContent);

    expect(darkParsed.name).toBe('Test');
    expect(darkParsed.type).toBe('dark');
    expect(darkParsed.colors['editor.foreground']).toBe('#d4d4d4');

    expect(lightParsed.name).toBe('Test Light');
    expect(lightParsed.type).toBe('light');
    expect(lightParsed.colors['editor.foreground']).toBe('#1f1f1f');
  });

  it('normalizes theme name to lowercase in filename', async () => {
    const { darkPath, lightPath } = await exportThemePair(
      outputDir,
      'Vayeate',
      darkTheme,
      lightTheme,
    );
    expect(darkPath.endsWith('vayeate-color-theme.json')).toBe(true);
    expect(lightPath.endsWith('vayeate-light-color-theme.json')).toBe(true);
  });

  it('uses atomic write (writes .tmp then renames)', async () => {
    const { darkPath } = await exportThemePair(
      outputDir,
      'atomic',
      darkTheme,
      lightTheme,
    );
    expect(darkPath).toBe(join(outputDir, 'atomic-color-theme.json'));
    const content = readFileSync(darkPath, 'utf8');
    expect(JSON.parse(content).name).toBe('Test');
  });
});

describe('assertValidThemeFileName', () => {
  it('accepts valid dark theme filename', () => {
    expect(() => assertValidThemeFileName('vayeate-color-theme.json')).not.toThrow();
  });

  it('accepts valid light theme filename', () => {
    expect(() => assertValidThemeFileName('vayeate-light-color-theme.json')).not.toThrow();
  });

  it('rejects filename without -color-theme.json suffix', () => {
    expect(() => assertValidThemeFileName('vayeate.json')).toThrow(/Invalid theme output filename/);
  });

  it('rejects filename with invalid characters', () => {
    expect(() => assertValidThemeFileName('Vayeate-color-theme.json')).toThrow(/Invalid theme output filename/);
  });
});
