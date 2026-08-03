import 'reflect-metadata';
import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { generateTheme } from '../../src/domain/operations/Theme/theme-operations/theme-utils/theme-generator-operation';
import { templateSchema } from '../../src/model/Template/schema/template-schemas';
import { themeSchema } from '../../src/model/Theme/schema/theme-schemas';

const studioRoot = path.resolve(import.meta.dirname, '../..');
const repositoryRoot = path.resolve(studioRoot, '..');
const themeDataDirectory = path.join(studioRoot, 'data', 'themes');
const generatedThemeDirectory = path.join(repositoryRoot, 'themes');

interface Rgb {
  red: number;
  green: number;
  blue: number;
}

function parseHex(value: string): Rgb {
  return {
    red: Number.parseInt(value.slice(1, 3), 16),
    green: Number.parseInt(value.slice(3, 5), 16),
    blue: Number.parseInt(value.slice(5, 7), 16),
  };
}

function luminance(value: string): number {
  const { red, green, blue } = parseHex(value);
  const linear = (channel: number) => {
    const normalized = channel / 255;
    return normalized <= 0.04045
      ? normalized / 12.92
      : ((normalized + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * linear(red) + 0.7152 * linear(green) + 0.0722 * linear(blue);
}

function contrast(first: string, second: string): number {
  const light = Math.max(luminance(first), luminance(second));
  const dark = Math.min(luminance(first), luminance(second));
  return (light + 0.05) / (dark + 0.05);
}

function hue(value: string): number {
  const { red, green, blue } = parseHex(value);
  const normalized = [red, green, blue].map((channel) => channel / 255);
  const max = Math.max(...normalized);
  const min = Math.min(...normalized);
  const delta = max - min;
  if (delta === 0) return 0;

  let result: number;
  if (max === normalized[0]) result = 60 * (((normalized[1] - normalized[2]) / delta) % 6);
  else if (max === normalized[1]) result = 60 * ((normalized[2] - normalized[0]) / delta + 2);
  else result = 60 * ((normalized[0] - normalized[1]) / delta + 4);
  return result < 0 ? result + 360 : result;
}

function hueDistance(first: string, second: string): number {
  const difference = Math.abs(hue(first) - hue(second));
  return Math.min(difference, 360 - difference);
}

describe('light theme quality', () => {
  it('keeps every tracked light export synchronized, readable, and analogous to its dark pair', () => {
    const template = templateSchema.parse(
      JSON.parse(
        fs.readFileSync(path.join(studioRoot, 'data', 'templates', 'vayeate-1.0.17.template.json'), 'utf8'),
      ),
    );
    const sourceFiles = fs.readdirSync(themeDataDirectory).filter((name) => name.endsWith('.theme.json'));

    expect(sourceFiles).toHaveLength(17);

    for (const sourceFile of sourceFiles) {
      const theme = themeSchema.parse(
        JSON.parse(fs.readFileSync(path.join(themeDataDirectory, sourceFile), 'utf8')),
      );
      const slug = theme.name.toLowerCase();
      const lightPath = path.join(generatedThemeDirectory, `${slug}-light-color-theme.json`);
      const darkPath = path.join(generatedThemeDirectory, `${slug}-color-theme.json`);
      const trackedLight = JSON.parse(fs.readFileSync(lightPath, 'utf8'));
      const trackedDark = JSON.parse(fs.readFileSync(darkPath, 'utf8'));
      const generatedLight = generateTheme(theme, template, 'light');
      const generatedDark = generateTheme(theme, template, 'dark');

      expect(trackedLight, `${theme.name} light export`).toEqual(generatedLight);
      expect(trackedDark, `${theme.name} dark counterpart`).toEqual(generatedDark);
      expect(theme.colorAssignments.every(({ light }) => light !== null), `${theme.name} light assignments`).toBe(true);

      const editorBackground = trackedLight.colors['editor.background'];
      expect(luminance(editorBackground), `${theme.name} editor background`).toBeGreaterThanOrEqual(0.7);

      const uiPairs = [
        ['activityBar.foreground', 'activityBar.background'],
        ['sideBar.foreground', 'sideBar.background'],
        ['editor.foreground', 'editor.background'],
        ['statusBar.foreground', 'statusBar.background'],
      ] as const;
      for (const [foregroundRef, backgroundRef] of uiPairs) {
        expect(
          contrast(trackedLight.colors[foregroundRef], trackedLight.colors[backgroundRef]),
          `${theme.name} ${foregroundRef}`,
        ).toBeGreaterThanOrEqual(4.5);
      }

      for (const rule of trackedLight.tokenColors) {
        if (!rule.settings.foreground) continue;
        expect(
          contrast(rule.settings.foreground, editorBackground),
          `${theme.name} ${rule.name}`,
        ).toBeGreaterThanOrEqual(3.5);
      }

      const darkChromeBackgrounds = [
        trackedDark.colors['activityBar.background'],
        trackedDark.colors['titleBar.activeBackground'],
        trackedDark.colors['statusBar.background'],
      ];
      expect(
        Math.min(...darkChromeBackgrounds.map((darkColor) => (
          hueDistance(trackedLight.colors['activityBar.background'], darkColor)
        ))),
        `${theme.name} chrome hue`,
      ).toBeLessThanOrEqual(75);
    }
  });
});
