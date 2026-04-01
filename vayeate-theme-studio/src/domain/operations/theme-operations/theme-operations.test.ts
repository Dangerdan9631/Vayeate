import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { container } from 'tsyringe';
import type { Theme } from '../../../model/schemas';
import { ThemeGateway } from '../../../gateway/theme/theme-gateway';
import {
  LoadThemeRefsOperation,
  createTheme,
  deleteTheme,
  generateTheme,
  loadTheme,
  saveTheme,
} from '.';
import { StoreStateSetter } from '../../state/store-state-setter';

const themeGatewayMock = {
  createTheme: vi.fn(),
  saveTheme: vi.fn(),
  loadTheme: vi.fn(),
  listThemes: vi.fn(),
  deleteTheme: vi.fn(),
  generateTheme: vi.fn(),
};

describe('theme-operations', () => {
  beforeEach(() => {
    container.registerInstance(ThemeGateway, themeGatewayMock as unknown as ThemeGateway);
    vi.mocked(themeGatewayMock.createTheme).mockResolvedValue({ name: 'th1', version: '1.0.0' } as Theme);
    vi.mocked(themeGatewayMock.saveTheme).mockResolvedValue(undefined);
    vi.mocked(themeGatewayMock.loadTheme).mockResolvedValue({ name: 'th1', version: '1.0.0' } as Theme);
    vi.mocked(themeGatewayMock.listThemes).mockResolvedValue([{ name: 'th1', version: '1.0.0' }]);
    vi.mocked(themeGatewayMock.deleteTheme).mockResolvedValue(undefined);
    vi.mocked(themeGatewayMock.generateTheme).mockResolvedValue({
      darkPath: 'exthemes/th1-color-theme.json',
      lightPath: 'exthemes/th1-light-color-theme.json',
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('createTheme calls themeGateway.createTheme and returns theme', async () => {
    const setState = vi.fn();
    const result = await createTheme(setState, { name: 'th1' });

    expect(themeGatewayMock.createTheme).toHaveBeenCalledTimes(1);
    expect(themeGatewayMock.createTheme).toHaveBeenCalledWith({ name: 'th1' });
    expect(result).toEqual({ name: 'th1', version: '1.0.0' });
  });

  it('LoadThemeRefsOperation.execute sets store entries from listThemes result', async () => {
    const setStoreState = vi.fn();
    const op = new LoadThemeRefsOperation(new StoreStateSetter(setStoreState), container.resolve(ThemeGateway));

    await op.execute();

    expect(themeGatewayMock.listThemes).toHaveBeenCalledTimes(1);
    expect(setStoreState).toHaveBeenCalledWith({
      type: 'SET_STORE_THEME_ENTRIES',
      entries: [{ name: 'th1', version: '1.0.0', isLoaded: false, theme: undefined }],
    });
  });

  it('loadTheme loads a theme and updates state', async () => {
    const setState = vi.fn();

    const loaded = await loadTheme(setState, 'th1', '1.0.0');

    expect(themeGatewayMock.loadTheme).toHaveBeenCalledTimes(1);
    expect(themeGatewayMock.loadTheme).toHaveBeenCalledWith('th1', '1.0.0');
    expect(setState).toHaveBeenCalledWith({
      type: 'SET_THEME',
      theme: { name: 'th1', version: '1.0.0' },
    });
    expect(loaded).toEqual({ name: 'th1', version: '1.0.0' });
  });

  it('saveTheme calls themeGateway.saveTheme', async () => {
    const theme = { name: 'th1', version: '1.0.0' } as Theme;

    await saveTheme(theme);

    expect(themeGatewayMock.saveTheme).toHaveBeenCalledTimes(1);
    expect(themeGatewayMock.saveTheme).toHaveBeenCalledWith(theme);
  });

  it('deleteTheme calls themeGateway.deleteTheme', async () => {
    await deleteTheme('th1', '1.0.0');

    expect(themeGatewayMock.deleteTheme).toHaveBeenCalledTimes(1);
    expect(themeGatewayMock.deleteTheme).toHaveBeenCalledWith('th1', '1.0.0');
  });

  it('generateTheme sets success result when generation succeeds', async () => {
    const setState = vi.fn();

    await generateTheme(setState, 'th1', '1.0.0', 't1', '1.0.0');

    expect(themeGatewayMock.generateTheme).toHaveBeenCalledTimes(1);
    expect(themeGatewayMock.generateTheme).toHaveBeenCalledWith('th1', '1.0.0', 't1', '1.0.0');
    expect(setState).toHaveBeenNthCalledWith(1, { type: 'SET_GENERATE_RESULT', result: null });
    expect(setState).toHaveBeenNthCalledWith(2, {
      type: 'SET_GENERATE_RESULT',
      result: {
        success: true,
        message:
          'Generated exthemes/th1-color-theme.json and exthemes/th1-light-color-theme.json',
      },
    });
  });

  it('generateTheme sets failure result when generation throws', async () => {
    vi.mocked(themeGatewayMock.generateTheme).mockRejectedValue(new Error('generation failed'));
    const setState = vi.fn();

    await generateTheme(setState, 'th1', '1.0.0', 't1', '1.0.0');

    expect(themeGatewayMock.generateTheme).toHaveBeenCalledTimes(1);
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
