import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Theme } from '../../../model/schemas';
import { themeService } from '../../../gateway/services/theme-service';
import {
  createTheme,
  deleteTheme,
  generateTheme,
  loadTheme,
  loadThemeRefs,
  saveTheme,
} from '.';

vi.mock('../../../gateway/services/theme-service', () => ({
  themeService: {
    createTheme: vi.fn(),
    saveTheme: vi.fn(),
    loadTheme: vi.fn(),
    listThemes: vi.fn(),
    deleteTheme: vi.fn(),
    generateTheme: vi.fn(),
  },
}));

describe('theme-operations', () => {
  beforeEach(() => {
    vi.mocked(themeService.createTheme).mockResolvedValue({ name: 'th1', version: '1.0.0' } as Theme);
    vi.mocked(themeService.saveTheme).mockResolvedValue(undefined);
    vi.mocked(themeService.loadTheme).mockResolvedValue({ name: 'th1', version: '1.0.0' } as Theme);
    vi.mocked(themeService.listThemes).mockResolvedValue([{ name: 'th1', version: '1.0.0' }]);
    vi.mocked(themeService.deleteTheme).mockResolvedValue(undefined);
    vi.mocked(themeService.generateTheme).mockResolvedValue({ darkPath: 'dark.json', lightPath: 'light.json' });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('createTheme calls themeService.createTheme and returns theme', async () => {
    const setState = vi.fn();
    const result = await createTheme(setState, { name: 'th1' });

    expect(themeService.createTheme).toHaveBeenCalledTimes(1);
    expect(themeService.createTheme).toHaveBeenCalledWith({ name: 'th1' });
    expect(result).toEqual({ name: 'th1', version: '1.0.0' });
  });

  it('loadThemeRefs sets store entries from listThemes result', async () => {
    const setState = vi.fn();
    const setStoreState = vi.fn();

    await loadThemeRefs(setState, setStoreState);

    expect(themeService.listThemes).toHaveBeenCalledTimes(1);
    expect(setStoreState).toHaveBeenCalledWith({
      type: 'SET_STORE_THEME_ENTRIES',
      entries: [{ name: 'th1', version: '1.0.0', isLoaded: false, theme: undefined }],
    });
  });

  it('loadTheme loads a theme and updates state', async () => {
    const setState = vi.fn();

    const loaded = await loadTheme(setState, 'th1', '1.0.0');

    expect(themeService.loadTheme).toHaveBeenCalledTimes(1);
    expect(themeService.loadTheme).toHaveBeenCalledWith('th1', '1.0.0');
    expect(setState).toHaveBeenCalledWith({
      type: 'SET_THEME',
      theme: { name: 'th1', version: '1.0.0' },
    });
    expect(loaded).toEqual({ name: 'th1', version: '1.0.0' });
  });

  it('saveTheme calls themeService.saveTheme', async () => {
    const theme = { name: 'th1', version: '1.0.0' } as Theme;

    await saveTheme(theme);

    expect(themeService.saveTheme).toHaveBeenCalledTimes(1);
    expect(themeService.saveTheme).toHaveBeenCalledWith(theme);
  });

  it('deleteTheme calls themeService.deleteTheme', async () => {
    await deleteTheme('th1', '1.0.0');

    expect(themeService.deleteTheme).toHaveBeenCalledTimes(1);
    expect(themeService.deleteTheme).toHaveBeenCalledWith('th1', '1.0.0');
  });

  it('generateTheme sets success result when generation succeeds', async () => {
    const setState = vi.fn();

    await generateTheme(setState, 'th1', '1.0.0', 't1', '1.0.0');

    expect(themeService.generateTheme).toHaveBeenCalledTimes(1);
    expect(themeService.generateTheme).toHaveBeenCalledWith('th1', '1.0.0', 't1', '1.0.0');
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
    vi.mocked(themeService.generateTheme).mockRejectedValue(new Error('generation failed'));
    const setState = vi.fn();

    await generateTheme(setState, 'th1', '1.0.0', 't1', '1.0.0');

    expect(themeService.generateTheme).toHaveBeenCalledTimes(1);
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