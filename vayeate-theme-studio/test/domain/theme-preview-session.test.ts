import 'reflect-metadata';
import { describe, expect, it, vi } from 'vitest';
import { OpenInAppPreviewController } from '../../src/app/controllers/Theme/editor-previews-card/open-in-app-preview-controller';
import { OpenThemePreviewHostController } from '../../src/app/controllers/Theme/editor-previews-card/open-theme-preview-host-controller';
import { ResolveEditorPreviewScopeMapController } from '../../src/app/controllers/Theme/editor-previews-card/resolve-editor-preview-scope-map-controller';
import { OpenThemePreviewHostOperation } from '../../src/domain/operations/Theme/theme-operations/previews/open-theme-preview-host-operation';
import type { LoadPreviewsOperation } from '../../src/domain/operations/Theme/theme-operations/previews/load-previews-operation';
import type { OpenInAppPreviewOperation } from '../../src/domain/operations/Theme/theme-operations/previews/open-in-app-preview-operation';
import type { ResolveEditorPreviewScopeMapOperation } from '../../src/domain/operations/Theme/theme-operations/previews/resolve-editor-preview-scope-map-operation';
import type { EnqueueBackgroundQueueActionOperation } from '../../src/domain/operations/Queue/background-queue/enqueue-background-queue-action-operation';
import { ThemePreviewStore } from '../../src/domain/state/Theme/ui/theme-preview-store';
import type { ThemeUiStore } from '../../src/domain/state/Theme/ui/theme-ui-store';
import type { LiveThemeExportGateway } from '../../src/gateway/gateway/Theme/theme/live-theme-export-gateway';
import type { ThemePreviewHostService } from '../../src/gateway/services/Common/theme-preview-host-service';
import type { Theme } from '../../src/model/Theme/schema/theme-schemas';

function buildTheme(): Theme {
  return {
    name: 'demo',
    version: '1.0.0',
    templateRef: { name: 'base', version: '1.0.0' },
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
}

describe('theme preview session gating', () => {
  it('starts closed and loads in-app preview content only after the open interaction', () => {
    const store = new ThemePreviewStore();
    const open = vi.fn(() => store.getStore().setInAppPreviewOpen(true));
    const load = vi.fn();
    const controller = new OpenInAppPreviewController(
      { execute: open } as unknown as OpenInAppPreviewOperation,
      { execute: load } as unknown as LoadPreviewsOperation,
      store,
    );

    expect(store.getStore().state.isInAppPreviewOpen).toBe(false);
    controller.run();
    controller.run();

    expect(store.getStore().state.isInAppPreviewOpen).toBe(true);
    expect(open).toHaveBeenCalledOnce();
    expect(load).toHaveBeenCalledOnce();
  });

  it('does not schedule scope-map updates before the in-app preview is open', () => {
    const store = new ThemePreviewStore();
    const resolve = vi.fn();
    const themeUiStore = {
      getStore: () => ({
        state: {
          panePreviewColorAssignments: [],
          theme: null,
          scopeThemeInputsGeneration: 0,
        },
      }),
    } as unknown as ThemeUiStore;
    const controller = new ResolveEditorPreviewScopeMapController(
      { execute: resolve } as unknown as ResolveEditorPreviewScopeMapOperation,
      store,
      themeUiStore,
    );

    controller.run();
    expect(resolve).not.toHaveBeenCalled();

    store.getStore().setInAppPreviewOpen(true);
    controller.run();
    expect(resolve).toHaveBeenCalledOnce();
  });

  it('enables live regeneration, exports the selected theme, and opens the host', async () => {
    const store = new ThemePreviewStore();
    const enable = vi.fn();
    const exportThemePair = vi.fn().mockResolvedValue(undefined);
    const open = vi.fn().mockResolvedValue(undefined);
    let queuedWork: (() => Promise<void>) | undefined;
    const enqueue = vi.fn(
      (_queue: string, _description: string, run: () => Promise<void>) => {
        queuedWork = run;
      },
    );
    const operation = new OpenThemePreviewHostOperation(
      store,
      {
        enable,
        disable: vi.fn(),
        exportThemePair,
      } as unknown as LiveThemeExportGateway,
      { open } as unknown as ThemePreviewHostService,
      { execute: enqueue } as unknown as EnqueueBackgroundQueueActionOperation,
    );
    const theme = buildTheme();

    operation.execute(theme);
    expect(store.getStore().state.isPreviewHostOpening).toBe(true);
    expect(open).not.toHaveBeenCalled();

    await queuedWork?.();

    expect(enable).toHaveBeenCalledOnce();
    expect(exportThemePair).toHaveBeenCalledWith(theme);
    expect(open).toHaveBeenCalledWith('demo');
    expect(store.getStore().state.isPreviewHostEnabled).toBe(true);
    expect(store.getStore().state.isPreviewHostOpening).toBe(false);
  });

  it('passes the currently selected theme snapshot into the preview-host workflow', () => {
    const theme = buildTheme();
    const execute = vi.fn();
    const controller = new OpenThemePreviewHostController(
      {
        getStore: () => ({ state: { theme } }),
      } as unknown as ThemeUiStore,
      { execute } as unknown as OpenThemePreviewHostOperation,
    );

    controller.run();

    expect(execute).toHaveBeenCalledWith(theme);
  });
});
