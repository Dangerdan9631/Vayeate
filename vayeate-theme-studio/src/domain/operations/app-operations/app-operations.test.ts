import { beforeEach, describe, expect, it, vi } from 'vitest';
import { container } from 'tsyringe';
import { LoadAppConfig, SaveAppConfig, SetColorScheme } from '.';
import { ConfigGateway } from '../../../gateway/config/config-gateway';
import { AppStateGetter } from '../../state/app-state-getter';
import { AppStateSetter } from '../../state/app-state-setter';
import { initialAppState } from '../../state/app-state';

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

  it('SetColorScheme applies SET_COLOR_SCHEME via AppStateSetter', () => {
    const apply = vi.fn();
    container.registerInstance(AppStateSetter, new AppStateSetter(apply));
    container.resolve(SetColorScheme).execute('light');
    expect(apply).toHaveBeenCalledWith({ type: 'SET_COLOR_SCHEME', scheme: 'light' });
  });

  it('LoadAppConfig loads from gateway and applies SET_APP_CONFIG', async () => {
    vi.mocked(configMock.load).mockResolvedValue({ colorScheme: 'light' });
    const apply = vi.fn();
    container.registerInstance(AppStateSetter, new AppStateSetter(apply));
    await container.resolve(LoadAppConfig).execute();
    expect(configMock.load).toHaveBeenCalledTimes(1);
    expect(apply).toHaveBeenCalledWith({ type: 'SET_APP_CONFIG', config: { colorScheme: 'light' } });
  });

  it('SaveAppConfig persists appConfig from state via gateway', async () => {
    container.registerInstance(
      AppStateGetter,
      new AppStateGetter(() => ({ ...initialAppState, appConfig: { colorScheme: 'light' } })),
    );
    await container.resolve(SaveAppConfig).execute();
    expect(configMock.save).toHaveBeenCalledTimes(1);
    expect(configMock.save).toHaveBeenCalledWith({ colorScheme: 'light' });
  });
});
