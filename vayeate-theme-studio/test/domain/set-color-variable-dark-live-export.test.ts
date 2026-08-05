import 'reflect-metadata';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { BackgroundQueuePort } from '../../src/domain/operations/Queue/background-queue/background-queue-port';
import { SetColorVariableDarkOperation } from '../../src/domain/operations/Theme/theme-operations/theme-details/set-color-variable-dark-operation';
import type { ThemesStore } from '../../src/domain/state/Theme/data/themes-store';
import type { ThemeUiStore } from '../../src/domain/state/Theme/ui/theme-ui-store';
import type { Theme } from '../../src/model/Theme/schema/theme-schemas';
import {
  DebouncedThemePersistGateway,
  SAVE_THEME_DEBOUNCE_MS,
} from '../../src/gateway/gateway/Theme/theme/debounced-theme-persist-gateway';
import type { LiveThemeExportGateway } from '../../src/gateway/gateway/Theme/theme/live-theme-export-gateway';
import type { ThemeGateway } from '../../src/gateway/gateway/Theme/theme/theme-gateway';

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
    colorAssignments: [
      {
        colorRef: 'fg',
        dark: { value: '#111111' },
        light: { value: '#EEEEEE' },
        useDarkForLight: false,
      },
    ],
    contrastAssignments: [],
    styleAssignments: [],
    applyPaletteToDark: true,
    applyPaletteToLight: true,
    paletteClusterCountK: 5,
    paletteClusterGroupIds: [],
  };
}

describe('color variable edits refresh live theme export', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('schedules live export after a color-variable dark commit', async () => {
    const theme = buildTheme();
    const setTheme = vi.fn();
    const setThemeLoadState = vi.fn();
    const setSaveError = vi.fn();
    const updateTheme = vi.fn();
    const saveTheme = vi.fn().mockResolvedValue(undefined);
    const exportThemePair = vi.fn().mockResolvedValue(undefined);
    let queuedWork: (() => Promise<void>) | undefined;
    const enqueue = vi.fn(
      (
        _queue: string,
        _description: string,
        run: () => Promise<void>,
      ) => {
        queuedWork = run;
      },
    );
    const debouncedPersist = new DebouncedThemePersistGateway(
      { enqueue } as unknown as BackgroundQueuePort,
      { saveTheme } as unknown as ThemeGateway,
      { exportThemePair } as unknown as LiveThemeExportGateway,
    );
    const operation = new SetColorVariableDarkOperation(
      {
        getStore: () => ({
          state: {
            theme,
            selectedRef: { name: theme.name, version: theme.version },
          },
          setTheme,
          setThemeLoadState,
          setSaveError,
        }),
      } as unknown as ThemeUiStore,
      {
        getStore: () => ({
          updateTheme,
        }),
      } as unknown as ThemesStore,
      debouncedPersist,
    );

    const result = operation.execute('fg', '#ABCDEF');
    expect(result?.changed).toBe(true);
    expect(enqueue).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(SAVE_THEME_DEBOUNCE_MS);
    expect(enqueue).toHaveBeenCalledOnce();
    await queuedWork?.();

    const exportedTheme = exportThemePair.mock.calls[0]?.[0] as Theme;
    expect(saveTheme).toHaveBeenCalledOnce();
    expect(exportThemePair).toHaveBeenCalledOnce();
    expect(exportedTheme.colorAssignments[0]?.dark?.value).toBe('#abcdef');
  });
});
