import { describe, it, expect, vi } from 'vitest';
import { BootstrapAppController } from './bootstrapApp';
import type { InitializeWindowService, TearDownWindowService } from '../../operations/app-operations';

describe('BootstrapAppController', () => {
  it('run initializes window listeners and returns a teardown that tears down the window service', () => {
    const initializeWindowService = { execute: vi.fn() };
    const tearDownWindowService = { execute: vi.fn() };
    const controller = new BootstrapAppController(
      initializeWindowService as unknown as InitializeWindowService,
      tearDownWindowService as unknown as TearDownWindowService,
    );

    const teardown = controller.run();

    expect(initializeWindowService.execute).toHaveBeenCalledTimes(1);
    expect(tearDownWindowService.execute).not.toHaveBeenCalled();

    teardown();

    expect(tearDownWindowService.execute).toHaveBeenCalledTimes(1);
  });
});
