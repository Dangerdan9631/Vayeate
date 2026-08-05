import 'reflect-metadata';
import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { generateTheme } from '../../src/domain/operations/Theme/theme-operations/theme-utils/theme-generator-operation';
import { templateSchema } from '../../src/model/Template/schema/template-schemas';
import { themeSchema } from '../../src/model/Theme/schema/theme-schemas';

const studioRoot = path.resolve(import.meta.dirname, '../..');
const repositoryRoot = path.resolve(studioRoot, '..');

const customColorIds = [
  ...Array.from({ length: 6 }, (_, index) => `vayeate.markdownHeading${index + 1}Foreground`),
  'vayeate.markdownBoldForeground',
  'vayeate.markdownItalicForeground',
  'vayeate.markdownUnorderedListMarkerForeground',
  'vayeate.markdownOrderedListMarkerForeground',
  'vayeate.markdownQuoteForeground',
  'vayeate.markdownTableHeaderForeground',
  'vayeate.markdownTableHeaderBackground',
  'vayeate.markdownTableHeaderBorder',
  'vayeate.markdownBackground',
  'vayeate.markdownCodeBlockBackground',
  'vayeate.markdownQuoteBackground',
  'vayeate.markdownTableRowBackground',
];

const nativeColorIds = [
  'textBlockQuote.background',
  'textBlockQuote.border',
  'textCodeBlock.background',
  'textLink.activeForeground',
  'textLink.foreground',
  'textPreformat.background',
  'textPreformat.border',
  'textPreformat.foreground',
  'textSeparator.foreground',
  'markdownAlert.note.foreground',
  'markdownAlert.tip.foreground',
  'markdownAlert.important.foreground',
  'markdownAlert.warning.foreground',
  'markdownAlert.caution.foreground',
];

describe('Markdown Preview theme support', () => {
  it('generates all preview colors for dark and light themes', () => {
    const template = templateSchema.parse(JSON.parse(fs.readFileSync(
      path.join(studioRoot, 'data', 'templates', 'vayeate-1.0.18.template.json'), 'utf8',
    )));
    const theme = themeSchema.parse(JSON.parse(fs.readFileSync(
      path.join(studioRoot, 'data', 'themes', 'Vayeate-1.0.0.theme.json'), 'utf8',
    )));

    for (const kind of ['dark', 'light'] as const) {
      const generated = generateTheme(theme, template, kind);
      for (const colorId of [...nativeColorIds, ...customColorIds]) {
        expect(generated.colors[colorId], `${kind} ${colorId}`).toMatch(/^#[0-9a-f]{6}$/i);
      }
    }
  });

  it('registers preview color defaults and styles custom Markdown colors', () => {
    const manifest = JSON.parse(fs.readFileSync(path.join(repositoryRoot, 'package.json'), 'utf8'));
    const css = fs.readFileSync(path.join(repositoryRoot, 'styles', 'markdown-preview.css'), 'utf8');
    const registeredIds = manifest.contributes.colors.map(({ id }: { id: string }) => id);

    expect(manifest.contributes['markdown.previewStyles']).toContain('./styles/markdown-preview.css');
    expect(registeredIds).toEqual(customColorIds);
    expect(manifest.contributes.colors.every(({ description }: { description?: string }) => Boolean(description))).toBe(true);
    for (const colorId of customColorIds) {
      expect(css).toContain(`--vscode-${colorId.replace(/\./g, '-')}`);
    }
    expect(css).not.toContain('var(--vscode-editor-foreground)');
  });
});
