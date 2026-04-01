import { beforeEach, describe, expect, it, vi } from 'vitest';
import { container } from 'tsyringe';
import { CloseAllMenusOperation, LoadAppConfigOperation, SaveAppConfigOperation, SetColorSchemeOperation, SetMenuOpenStateOperation } from '.';
import { ConfigGateway } from '../../../gateway/config/config-gateway';
import { AppStateGetter } from '../../state/app-state-getter';
import { AppStateSetter } from '../../state/app-state-setter';
import { initialAppState } from '../../state/app-state';
import { UiStateSetter } from '../../state/ui-state-setter';

const configMock = {
  load: vi.fn().mockResolvedValue({ colorScheme: 'dark' as const }),
  save: vi.fn().mockResolvedValue(undefined),
};

describe('app-operations', () => {
  beforeEach(() => {
    container.registerInstance(ConfigGateway, configMock as unknown as ConfigGateway);
    vi.mocked(configMock.load).mockClear();
    vi.mocked(configMock.save).mockClear();
  });

  it('SetColorSchemeOperation applies SET_COLOR_SCHEME via AppStateSetter', () => {
    const apply = vi.fn();
    container.registerInstance(AppStateSetter, new AppStateSetter(apply));
    container.resolve(SetColorSchemeOperation).execute('light');
    expect(apply).toHaveBeenCalledWith({ type: 'SET_COLOR_SCHEME', scheme: 'light' });
  });

  it('SetMenuOpenStateOperation applies SET_UI_MENU_OPEN_STATE via UiStateSetter', () => {
    const apply = vi.fn();
    container.registerInstance(UiStateSetter, new UiStateSetter(apply));
    container.resolve(SetMenuOpenStateOperation).execute('history', true);
    expect(apply).toHaveBeenCalledWith({ type: 'SET_UI_MENU_OPEN_STATE', menuId: 'history', isOpen: true });
  });

  it('CloseAllMenusOperation applies SET_UI_ALL_MENUS_CLOSED via UiStateSetter', () => {
    const apply = vi.fn();
    container.registerInstance(UiStateSetter, new UiStateSetter(apply));
    container.resolve(CloseAllMenusOperation).execute();
    expect(apply).toHaveBeenCalledWith({ type: 'SET_UI_ALL_MENUS_CLOSED' });
  });

  it('LoadAppConfigOperation loads from gateway and applies SET_APP_CONFIG', async () => {
    vi.mocked(configMock.load).mockResolvedValue({ colorScheme: 'light' });
    const apply = vi.fn();
    container.registerInstance(AppStateSetter, new AppStateSetter(apply));
    await container.resolve(LoadAppConfigOperation).execute();
    expect(configMock.load).toHaveBeenCalledTimes(1);
    expect(apply).toHaveBeenCalledWith({ type: 'SET_APP_CONFIG', config: { colorScheme: 'light' } });
  });

  it('SaveAppConfigOperation persists appConfig from state via gateway', async () => {
    container.registerInstance(
      AppStateGetter,
      new AppStateGetter(() => ({ ...initialAppState, appConfig: { colorScheme: 'light' } })),
    );
    await container.resolve(SaveAppConfigOperation).execute();
    expect(configMock.save).toHaveBeenCalledTimes(1);
    expect(configMock.save).toHaveBeenCalledWith({ colorScheme: 'light' });
  });
});
