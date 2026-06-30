import { describe, expect, it, vi } from 'vitest';
import { TemplateGateway } from '../../../../gateway/template/template-gateway';
import { ThemeGateway } from '../../../../gateway/theme/theme-gateway';
import type { BackgroundQueueContinuation, BackgroundQueueKey } from '../../../../model/background-queue';
import type { Template } from '../../../../model/schema/template-schemas';
import type { Theme } from '../../../../model/schema/theme-schemas';
import { ThemesStore } from '../../../state/data/themes-store';
import { ThemePreviewStore } from '../../../state/ui/theme-preview-store';
import { ThemeUiStore } from '../../../state/ui/theme-ui-store';
import { EnqueueBackgroundQueueActionOperation } from '../../background-queue/enqueue-background-queue-action-operation';
import { LoadThemeWithLinkedTemplateOperation } from './load-theme-with-linked-template-operation';

const theme: Theme = {
  name: 'baseline',
  version: '1.0.0',
  templateRef: { name: 'template-a', version: '1.0.0' },
  idePrimaryTokenRef: null,
  ideForegroundTokenRef: null,
  themeBackgroundTokenRef: null,
  themeForegroundTokenRef: null,
  lineNumberBackgroundTokenRef: null,
  lineNumberForegroundTokenRef: null,
  ideTabTokenRef: null,
  ideTabBarBackgroundTokenRef: null,
  ideTabBarForegroundTokenRef: null,
  editorPreviewScrollbarBackgroundTokenRef: null,
  editorPreviewScrollbarForegroundTokenRef: null,
  editorPreviewSelectionBackgroundTokenRef: null,
  editorPreviewMenuForegroundTokenRef: null,
  editorPreviewMenuBackgroundTokenRef: null,
  colorAssignments: [],
  contrastAssignments: [],
  styleAssignments: [],
  applyPaletteToDark: true,
  applyPaletteToLight: true,
  paletteClusterCountK: 5,
  paletteClusterGroupIds: [],
};

const template: Template = {
  name: 'template-a',
  version: '1.0.0',
  locked: false,
  catalogRefs: [],
  mappings: [],
  colorVariables: [],
  contrastVariables: [],
  styleVariables: [{ key: 'emphasis', groupRef: null }],
  groups: [],
  semanticTokenModifiers: [],
  semanticTokenLanguages: [],
};

function createContinuation(): BackgroundQueueContinuation {
  return {
    onQueue: vi.fn(() => createContinuation()),
    then: vi.fn(),
  };
}

describe('LoadThemeWithLinkedTemplateOperation', () => {
  it('normalizes loaded theme assignments with the linked template before updating theme state', async () => {
    const queuedRuns: Array<() => void | Promise<void>> = [];
    const backgroundQueue = {
      enqueue: vi.fn((
        _queue: BackgroundQueueKey,
        _description: string,
        run: () => void | Promise<void>,
      ) => {
        queuedRuns.push(run);
        return createContinuation();
      }),
    };
    const themesStore = new ThemesStore();
    const themeUiStore = new ThemeUiStore();
    const themePreviewStore = new ThemePreviewStore();
    const themeGateway = {
      loadTheme: vi.fn(async () => theme),
    };
    const templateGateway = {
      loadTemplate: vi.fn(async () => template),
    };
    const operation = new LoadThemeWithLinkedTemplateOperation(
      themesStore,
      themeUiStore,
      themePreviewStore,
      themeGateway as unknown as ThemeGateway,
      templateGateway as unknown as TemplateGateway,
      new EnqueueBackgroundQueueActionOperation(backgroundQueue as never),
    );

    operation.execute('baseline', '1.0.0');

    const run = queuedRuns[0];
    if (!run) {
      throw new Error('Expected load work to be queued');
    }
    await run();

    expect(themeUiStore.getStore().state.theme?.styleAssignments).toEqual([
      {
        styleVariableRef: 'emphasis',
        light: null,
        dark: null,
        useDarkForLight: false,
      },
    ]);
    expect(themesStore.getStore().state.themeMap.baseline?.['1.0.0']?.theme?.styleAssignments).toEqual(
      themeUiStore.getStore().state.theme?.styleAssignments,
    );
    expect(themePreviewStore.getStore().state.loadedTemplateForTheme?.styleVariables).toEqual(template.styleVariables);
  });
});
