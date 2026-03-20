import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ToggleColorScheme } from '../../operations/app-operations';
import { ToggleColorSchemeController } from './toggleColorScheme';

describe('ToggleColorSchemeController', () => {
  let controller: ToggleColorSchemeController;
  let execute: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    execute = vi.fn().mockResolvedValue(undefined);
    const operation = { execute } as unknown as ToggleColorScheme;
    controller = new ToggleColorSchemeController(operation);
  });

  it('run delegates to ToggleColorScheme execute', async () => {
    await controller.run(true);
    expect(execute).toHaveBeenCalledTimes(1);
    expect(execute).toHaveBeenCalledWith(true);
  });
});
