import 'reflect-metadata';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { BackgroundQueuePort } from '../../src/domain/operations/Queue/background-queue/background-queue-port';
import type { Theme } from '../../src/model/Theme/schema/theme-schemas';
import {
  DebouncedThemePersistGateway,
  SAVE_THEME_DEBOUNCE_MS,
} from '../../src/gateway/gateway/Theme/theme/debounced-theme-persist-gateway';
import type { LiveThemeExportGateway } from '../../src/gateway/gateway/Theme/theme/live-theme-export-gateway';
import type { ThemeGateway } from '../../src/gateway/gateway/Theme/theme/theme-gateway';

function buildTheme(name = 'demo', version = '1.0.0'): Theme {
  return {
    name,
    version,
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

describe('DebouncedThemePersistGateway live export', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('persists the source theme then refreshes live export after debounce', async () => {
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
    const gateway = new DebouncedThemePersistGateway(
      { enqueue } as unknown as BackgroundQueuePort,
      { saveTheme } as unknown as ThemeGateway,
      { exportThemePair } as unknown as LiveThemeExportGateway,
    );
    const theme = buildTheme();

    gateway.schedule(theme);
    expect(enqueue).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(SAVE_THEME_DEBOUNCE_MS);
    expect(enqueue).toHaveBeenCalledOnce();
    expect(enqueue).toHaveBeenCalledWith(
      'data_io',
      'Saving theme demo 1.0.0',
      expect.any(Function),
      { key: 'data/themes/demo-1.0.0.theme.json', access: 'write' },
    );

    await queuedWork?.();
    expect(saveTheme).toHaveBeenCalledWith(theme);
    expect(exportThemePair).toHaveBeenCalledWith(theme);
  });

  it('coalesces rapid schedules into one persist and live export', async () => {
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
    const gateway = new DebouncedThemePersistGateway(
      { enqueue } as unknown as BackgroundQueuePort,
      { saveTheme } as unknown as ThemeGateway,
      { exportThemePair } as unknown as LiveThemeExportGateway,
    );
    const first = buildTheme();
    const second: Theme = {
      ...first,
      colorAssignments: [
        {
          colorRef: 'fg',
          dark: { value: '#222222' },
          light: { value: '#DDDDDD' },
          useDarkForLight: false,
        },
      ],
    };

    gateway.schedule(first);
    await vi.advanceTimersByTimeAsync(SAVE_THEME_DEBOUNCE_MS / 2);
    gateway.schedule(second);
    await vi.advanceTimersByTimeAsync(SAVE_THEME_DEBOUNCE_MS);

    expect(enqueue).toHaveBeenCalledOnce();
    await queuedWork?.();
    expect(saveTheme).toHaveBeenCalledOnce();
    expect(saveTheme).toHaveBeenCalledWith(second);
    expect(exportThemePair).toHaveBeenCalledOnce();
    expect(exportThemePair).toHaveBeenCalledWith(second);
  });

  it('coalesces preview refreshes without persisting the selected theme', async () => {
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
    const gateway = new DebouncedThemePersistGateway(
      { enqueue } as unknown as BackgroundQueuePort,
      { saveTheme } as unknown as ThemeGateway,
      {
        isEnabled: () => true,
        exportThemePair,
      } as unknown as LiveThemeExportGateway,
    );
    const first = buildTheme();
    const second = { ...first, name: 'other' };

    gateway.schedulePreviewRefresh(first);
    gateway.schedulePreviewRefresh(second);
    await vi.advanceTimersByTimeAsync(SAVE_THEME_DEBOUNCE_MS);

    expect(enqueue).toHaveBeenCalledOnce();
    expect(enqueue).toHaveBeenCalledWith(
      'data_io',
      'Refreshing preview host for other 1.0.0',
      expect.any(Function),
      { key: 'data/themes/other-1.0.0.theme.json', access: 'write' },
    );
    await queuedWork?.();

    expect(saveTheme).not.toHaveBeenCalled();
    expect(exportThemePair).toHaveBeenCalledWith(second);
  });

  it('does not schedule a preview refresh before the preview host is open', async () => {
    const enqueue = vi.fn();
    const gateway = new DebouncedThemePersistGateway(
      { enqueue } as unknown as BackgroundQueuePort,
      { saveTheme: vi.fn() } as unknown as ThemeGateway,
      {
        isEnabled: () => false,
        exportThemePair: vi.fn(),
      } as unknown as LiveThemeExportGateway,
    );

    gateway.schedulePreviewRefresh(buildTheme());
    await vi.advanceTimersByTimeAsync(SAVE_THEME_DEBOUNCE_MS);

    expect(enqueue).not.toHaveBeenCalled();
  });

  it('reports live export failures through the save-error callback', async () => {
    const onError = vi.fn();
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
    const gateway = new DebouncedThemePersistGateway(
      { enqueue } as unknown as BackgroundQueuePort,
      { saveTheme: vi.fn().mockResolvedValue(undefined) } as unknown as ThemeGateway,
      {
        exportThemePair: vi.fn().mockRejectedValue(new Error('live export failed')),
      } as unknown as LiveThemeExportGateway,
    );

    gateway.schedule(buildTheme(), onError);
    await vi.advanceTimersByTimeAsync(SAVE_THEME_DEBOUNCE_MS);
    await queuedWork?.();

    expect(onError).toHaveBeenCalledWith('live export failed');
  });

  it('reports source theme persist failures through the save-error callback', async () => {
    const onError = vi.fn();
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
    const gateway = new DebouncedThemePersistGateway(
      { enqueue } as unknown as BackgroundQueuePort,
      {
        saveTheme: vi.fn().mockRejectedValue(new Error('persist failed')),
      } as unknown as ThemeGateway,
      { exportThemePair: vi.fn() } as unknown as LiveThemeExportGateway,
    );

    gateway.schedule(buildTheme(), onError);
    await vi.advanceTimersByTimeAsync(SAVE_THEME_DEBOUNCE_MS);
    await queuedWork?.();

    expect(onError).toHaveBeenCalledWith('persist failed');
  });
});
