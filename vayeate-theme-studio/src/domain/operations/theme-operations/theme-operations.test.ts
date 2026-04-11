import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { container } from 'tsyringe';
import type { Theme } from '../../../model/schemas';
import { ThemeGateway } from '../../../gateway/theme/theme-gateway';
import { initialThemesState } from '../../state/theme/themes-state';
import { ThemesStateGetter, ThemesStateSetter } from '../../state/theme/themes-state-reducer';
import {
  CreateThemeOperation,
  DeleteThemeOperation,
  GenerateThemeOperation,
  LoadThemeRefsOperation,
  LoadThemeOperation,
  SaveThemeOperation,
} from '.';

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

  it('CreateThemeOperation.execute calls themeGateway.createTheme and returns theme', async () => {
    const result = await container.resolve(CreateThemeOperation).execute({ name: 'th1' });

    expect(themeGatewayMock.createTheme).toHaveBeenCalledTimes(1);
    expect(themeGatewayMock.createTheme).toHaveBeenCalledWith({ name: 'th1' });
    expect(result).toEqual({ name: 'th1', version: '1.0.0' });
  });

  it('LoadThemeRefsOperation.execute sets theme map entries from listThemes result', async () => {
    const setThemesState = vi.fn();
    const op = new LoadThemeRefsOperation(new ThemesStateSetter(setThemesState), container.resolve(ThemeGateway));

    await op.execute();

    expect(themeGatewayMock.listThemes).toHaveBeenCalledTimes(1);
    expect(setThemesState).toHaveBeenCalledWith({
      type: 'SET_THEME_MAP_ENTRIES',
      entries: [{ name: 'th1', version: '1.0.0', isLoaded: false, theme: undefined }],
    });
  });

  it('LoadThemeOperation loads a theme and updates state', async () => {
    const setState = vi.fn();
    const op = new LoadThemeOperation(new ThemesStateSetter(setState), container.resolve(ThemeGateway));

    const loaded = await op.execute('th1', '1.0.0');

    expect(themeGatewayMock.loadTheme).toHaveBeenCalledTimes(1);
    expect(themeGatewayMock.loadTheme).toHaveBeenCalledWith('th1', '1.0.0');
    expect(setState).toHaveBeenCalledWith({
      type: 'SET_THEME',
      theme: { name: 'th1', version: '1.0.0' },
    });
    expect(loaded).toEqual({ name: 'th1', version: '1.0.0' });
  });

  it('SaveThemeOperation calls themeGateway.saveTheme', async () => {
    const theme = { name: 'th1', version: '1.0.0' } as Theme;

    await container.resolve(SaveThemeOperation).execute(theme);

    expect(themeGatewayMock.saveTheme).toHaveBeenCalledTimes(1);
    expect(themeGatewayMock.saveTheme).toHaveBeenCalledWith(theme);
  });

  it('DeleteThemeOperation calls themeGateway.deleteTheme', async () => {
    await container.resolve(DeleteThemeOperation).execute('th1', '1.0.0');

    expect(themeGatewayMock.deleteTheme).toHaveBeenCalledTimes(1);
    expect(themeGatewayMock.deleteTheme).toHaveBeenCalledWith('th1', '1.0.0');
  });

  it('GenerateThemeOperation sets success result when generation succeeds', async () => {
    const setState = vi.fn();
    const themeWithTemplate = {
      name: 'th1',
      version: '1.0.0',
      templateRef: { name: 't1', version: '1.0.0' },
    } as Theme;
    const getter = new ThemesStateGetter(() => ({
      ...initialThemesState,
      theme: themeWithTemplate,
    }));
    const op = new GenerateThemeOperation(getter, new ThemesStateSetter(setState), container.resolve(ThemeGateway));

    await op.execute();

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

  it('GenerateThemeOperation sets failure result when generation throws', async () => {
    vi.mocked(themeGatewayMock.generateTheme).mockRejectedValue(new Error('generation failed'));
    const setState = vi.fn();
    const themeWithTemplate = {
      name: 'th1',
      version: '1.0.0',
      templateRef: { name: 't1', version: '1.0.0' },
    } as Theme;
    const getter = new ThemesStateGetter(() => ({
      ...initialThemesState,
      theme: themeWithTemplate,
    }));
    const op = new GenerateThemeOperation(getter, new ThemesStateSetter(setState), container.resolve(ThemeGateway));

    await op.execute();

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
