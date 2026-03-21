import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { container } from 'tsyringe';
import type { Theme } from '../../../model/schemas';
import { ThemeService } from '../../../gateway/services/theme-service';
import {
  LoadThemeRefs,
  createTheme,
  deleteTheme,
  generateTheme,
  loadTheme,
  saveTheme,
} from '.';
import { StoreStateSetter } from '../../state/store-state-setter';

const themeServiceMock = {
  createTheme: vi.fn(),
  saveTheme: vi.fn(),
  loadTheme: vi.fn(),
  listThemes: vi.fn(),
  deleteTheme: vi.fn(),
  generateTheme: vi.fn(),
};

describe('theme-operations', () => {
  beforeEach(() => {
    container.registerInstance(ThemeService, themeServiceMock as unknown as ThemeService);
    vi.mocked(themeServiceMock.createTheme).mockResolvedValue({ name: 'th1', version: '1.0.0' } as Theme);
    vi.mocked(themeServiceMock.saveTheme).mockResolvedValue(undefined);
    vi.mocked(themeServiceMock.loadTheme).mockResolvedValue({ name: 'th1', version: '1.0.0' } as Theme);
    vi.mocked(themeServiceMock.listThemes).mockResolvedValue([{ name: 'th1', version: '1.0.0' }]);
    vi.mocked(themeServiceMock.deleteTheme).mockResolvedValue(undefined);
    vi.mocked(themeServiceMock.generateTheme).mockResolvedValue({ darkPath: 'dark.json', lightPath: 'light.json' });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('createTheme calls themeService.createTheme and returns theme', async () => {
    const setState = vi.fn();
    const result = await createTheme(setState, { name: 'th1' });

    expect(themeServiceMock.createTheme).toHaveBeenCalledTimes(1);
    expect(themeServiceMock.createTheme).toHaveBeenCalledWith({ name: 'th1' });
    expect(result).toEqual({ name: 'th1', version: '1.0.0' });
  });

  it('LoadThemeRefs.execute sets store entries from listThemes result', async () => {
    const setStoreState = vi.fn();
    const op = new LoadThemeRefs(new StoreStateSetter(setStoreState), container.resolve(ThemeService));

    await op.execute();

    expect(themeServiceMock.listThemes).toHaveBeenCalledTimes(1);
    expect(setStoreState).toHaveBeenCalledWith({
      type: 'SET_STORE_THEME_ENTRIES',
      entries: [{ name: 'th1', version: '1.0.0', isLoaded: false, theme: undefined }],
    });
  });

  it('loadTheme loads a theme and updates state', async () => {
    const setState = vi.fn();

    const loaded = await loadTheme(setState, 'th1', '1.0.0');

    expect(themeServiceMock.loadTheme).toHaveBeenCalledTimes(1);
    expect(themeServiceMock.loadTheme).toHaveBeenCalledWith('th1', '1.0.0');
    expect(setState).toHaveBeenCalledWith({
      type: 'SET_THEME',
      theme: { name: 'th1', version: '1.0.0' },
    });
    expect(loaded).toEqual({ name: 'th1', version: '1.0.0' });
  });

  it('saveTheme calls themeService.saveTheme', async () => {
    const theme = { name: 'th1', version: '1.0.0' } as Theme;

    await saveTheme(theme);

    expect(themeServiceMock.saveTheme).toHaveBeenCalledTimes(1);
    expect(themeServiceMock.saveTheme).toHaveBeenCalledWith(theme);
  });

  it('deleteTheme calls themeService.deleteTheme', async () => {
    await deleteTheme('th1', '1.0.0');

    expect(themeServiceMock.deleteTheme).toHaveBeenCalledTimes(1);
    expect(themeServiceMock.deleteTheme).toHaveBeenCalledWith('th1', '1.0.0');
  });

  it('generateTheme sets success result when generation succeeds', async () => {
    const setState = vi.fn();

    await generateTheme(setState, 'th1', '1.0.0', 't1', '1.0.0');

    expect(themeServiceMock.generateTheme).toHaveBeenCalledTimes(1);
    expect(themeServiceMock.generateTheme).toHaveBeenCalledWith('th1', '1.0.0', 't1', '1.0.0');
    expect(setState).toHaveBeenNthCalledWith(1, { type: 'SET_GENERATE_RESULT', result: null });
    expect(setState).toHaveBeenNthCalledWith(2, {
      type: 'SET_GENERATE_RESULT',
      result: {
        success: true,
        message: 'Generated dark.json and light.json',
      },
    });
  });

  it('generateTheme sets failure result when generation throws', async () => {
    vi.mocked(themeServiceMock.generateTheme).mockRejectedValue(new Error('generation failed'));
    const setState = vi.fn();

    await generateTheme(setState, 'th1', '1.0.0', 't1', '1.0.0');

    expect(themeServiceMock.generateTheme).toHaveBeenCalledTimes(1);
    expect(setState).toHaveBeenNthCalledWith(1, { type: 'SET_GENERATE_RESULT', result: null });
    expect(setState).toHaveBeenNthCalledWith(2, {
      type: 'SET_GENERATE_RESULT',
      result: {
        success: false,
        message: 'generation failed',
      },
    });
  });
});
