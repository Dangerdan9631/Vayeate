import { beforeEach, describe, expect, it, vi } from 'vitest';
import { container } from 'tsyringe';
import { SaveColorScheme, UnloadApplication } from '.';
import { ConfigGateway } from '../../../gateway/config/config-gateway';

const configMock = {
  save: vi.fn().mockResolvedValue(undefined),
};

describe('app-operations', () => {
  beforeEach(() => {
    container.registerInstance(ConfigGateway, configMock as unknown as ConfigGateway);
    vi.mocked(configMock.save).mockClear();
  });

  it('SaveColorScheme execute persists scheme via configService', async () => {
    await container.resolve(SaveColorScheme).execute('light');
    expect(configMock.save).toHaveBeenCalledTimes(1);
    expect(configMock.save).toHaveBeenCalledWith({ colorScheme: 'light' });
  });

  it('UnloadApplication execute resolves without throwing', async () => {
    await expect(new UnloadApplication().execute()).resolves.toBeUndefined();
  });
});
