import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SaveColorScheme, unloadApplication } from '.';
import { configService } from '../../../gateway/services/config-service';

vi.mock('../../../gateway/services/config-service', () => ({
  configService: { save: vi.fn().mockResolvedValue(undefined) },
}));

describe('app-operations', () => {
  beforeEach(() => {
    vi.mocked(configService.save).mockClear();
  });

  it('SaveColorScheme execute persists scheme via configService', async () => {
    await new SaveColorScheme().execute('light');
    expect(configService.save).toHaveBeenCalledTimes(1);
    expect(configService.save).toHaveBeenCalledWith({ colorScheme: 'light' });
  });

  it('unloadApplication resolves without throwing', async () => {
    await expect(unloadApplication()).resolves.toBeUndefined();
    await expect(unloadApplication(undefined)).resolves.toBeUndefined();
    const setState = () => {};
    await expect(unloadApplication(setState)).resolves.toBeUndefined();
  });
});
