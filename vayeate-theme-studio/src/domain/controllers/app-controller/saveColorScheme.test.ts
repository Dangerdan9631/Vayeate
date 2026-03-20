import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { SaveColorScheme } from '../../operations/app-operations';
import { SaveColorSchemeController } from './saveColorScheme';

describe('SaveColorSchemeController', () => {
  let execute: ReturnType<typeof vi.fn>;
  let controller: SaveColorSchemeController;

  beforeEach(() => {
    execute = vi.fn().mockResolvedValue(undefined);
    const operation = { execute } as unknown as SaveColorScheme;
    controller = new SaveColorSchemeController(operation);
  });

  it('run delegates to the injected SaveColorScheme', async () => {
    await controller.run('light');
    expect(execute).toHaveBeenCalledTimes(1);
    expect(execute).toHaveBeenCalledWith('light');
  });
});
