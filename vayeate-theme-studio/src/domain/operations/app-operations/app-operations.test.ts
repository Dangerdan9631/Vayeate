import { beforeEach, describe, expect, it, vi } from 'vitest';
import { container } from 'tsyringe';
import { SaveColorScheme, UnloadApplication } from '.';
import { ConfigService } from '../../../gateway/services/config-service';

const configMock = {
  save: vi.fn().mockResolvedValue(undefined),
};

describe('app-operations', () => {
  beforeEach(() => {
    container.registerInstance(ConfigService, configMock as unknown as ConfigService);
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
