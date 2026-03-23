import { describe, it, expect, vi } from 'vitest';
import { TearDownWindowService } from './tearDownWindowService';
import type { WindowService } from '../../../gateway/services/window-service';

describe('TearDownWindowService', () => {
  it('execute calls dispose on WindowService', () => {
    const dispose = vi.fn();
    const windowService = { dispose } as unknown as WindowService;
    new TearDownWindowService(windowService).execute();
    expect(dispose).toHaveBeenCalledTimes(1);
  });
});
