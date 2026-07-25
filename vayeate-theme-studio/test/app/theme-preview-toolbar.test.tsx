import 'reflect-metadata';
import { readFile } from 'node:fs/promises';
import { renderToStaticMarkup } from 'react-dom/server';
import { container } from 'tsyringe';
import { beforeEach, describe, expect, it } from 'vitest';
import { AppProvider } from '../../src/app/components/Common/app-shell/AppProvider';
import { LazyEditorPreviewsCard } from '../../src/app/components/Theme/editor-previews-card/LazyEditorPreviewsCard';
import { ThemePreviewStore } from '../../src/domain/state/Theme/ui/theme-preview-store';

describe('theme preview toolbar', () => {
  beforeEach(() => {
    const store = container.resolve(ThemePreviewStore);
    store.getStore().setInAppPreviewOpen(false);
    store.getStore().setPreviewHostStatus({
      isEnabled: false,
      isOpening: false,
      error: null,
    });
  });

  it('renders only the two-button toolbar before the in-app preview is opened', () => {
    const markup = renderToStaticMarkup(
      <AppProvider>
        <LazyEditorPreviewsCard />
      </AppProvider>,
    );

    expect(markup).toContain('Editor Previews');
    expect(markup).toContain('Open Preview');
    expect(markup).toContain('Open Preview Host');
    expect(markup.match(/<button/g)).toHaveLength(2);
    expect(markup).not.toContain('theme-previews-content');
    expect(markup).not.toContain('theme-preview-fields');
    expect(markup).not.toContain('theme-preview-columns');
  });

  it('keeps the toolbar sticky while the preview card scrolls', async () => {
    const styles = await readFile('src/styles.css', 'utf-8');
    const toolbarRule =
      styles.match(/\.theme-preview-toolbar\s*\{([^}]*)\}/)?.[1] ?? '';

    expect(toolbarRule).toContain('position: sticky');
    expect(toolbarRule).toContain('top: 0');
  });
});
