import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SaveColorScheme, UnloadApplication } from '.';
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

  it('UnloadApplication execute resolves without throwing', async () => {
    await expect(new UnloadApplication().execute()).resolves.toBeUndefined();
  });
});
