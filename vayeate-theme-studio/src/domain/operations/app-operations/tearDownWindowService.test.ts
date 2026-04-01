import { describe, it, expect, vi } from 'vitest';
import { TearDownWindowServiceOperation } from './tear-down-window-service-operation';
import type { WindowService } from '../../../gateway/services/window-service';

describe('TearDownWindowServiceOperation', () => {
  it('execute calls dispose on WindowService', () => {
    const dispose = vi.fn();
    const windowService = { dispose } as unknown as WindowService;
    new TearDownWindowServiceOperation(windowService).execute();
    expect(dispose).toHaveBeenCalledTimes(1);
  });
});
