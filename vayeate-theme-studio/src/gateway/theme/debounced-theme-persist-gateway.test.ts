import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createThemeWithParams } from '../../model/factories/theme-factory';
import { DebouncedThemePersistGateway } from './debounced-theme-persist-gateway';

describe('DebouncedThemePersistGateway', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('debounces to the latest theme and enqueues a keyed data_io write', async () => {
    const backgroundQueue = {
      enqueue: vi.fn((_queue: string, _description: string, _run: () => void | Promise<void>) => ({})),
    };
    const themeGateway = { saveTheme: vi.fn(async () => {}) };
    const gateway = new DebouncedThemePersistGateway(backgroundQueue as never, themeGateway as never);
    const first = createThemeWithParams({ name: 'first-theme' });
    const latest = createThemeWithParams({ name: 'latest-theme' });

    gateway.schedule(first);
    gateway.schedule(latest);
    await vi.advanceTimersByTimeAsync(399);

    expect(backgroundQueue.enqueue).not.toHaveBeenCalled();
    expect(themeGateway.saveTheme).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(1);

    expect(backgroundQueue.enqueue).toHaveBeenCalledTimes(1);
    expect(backgroundQueue.enqueue).toHaveBeenCalledWith(
      'data_io',
      'Saving theme latest-theme 1.0.0',
      expect.any(Function),
      { key: 'data/themes/latest-theme-1.0.0.theme.json', access: 'write' },
    );
    expect(themeGateway.saveTheme).not.toHaveBeenCalled();

    const run = backgroundQueue.enqueue.mock.calls[0][2] as () => Promise<void>;
    await run();
    expect(themeGateway.saveTheme).toHaveBeenCalledWith(latest);
  });

  it('cancels a pending persist before it is enqueued', async () => {
    const backgroundQueue = {
      enqueue: vi.fn((_queue: string, _description: string, _run: () => void | Promise<void>) => ({})),
    };
    const gateway = new DebouncedThemePersistGateway(
      backgroundQueue as never,
      { saveTheme: vi.fn() } as never,
    );

    gateway.schedule(createThemeWithParams({ name: 'cancelled-theme' }));
    gateway.cancel();
    await vi.advanceTimersByTimeAsync(400);

    expect(backgroundQueue.enqueue).not.toHaveBeenCalled();
  });

  it('reports persistence failures from inside the queued job', async () => {
    const backgroundQueue = {
      enqueue: vi.fn((_queue: string, _description: string, _run: () => void | Promise<void>) => ({})),
    };
    const themeGateway = { saveTheme: vi.fn(async () => { throw new Error('disk full'); }) };
    const onError = vi.fn();
    const gateway = new DebouncedThemePersistGateway(backgroundQueue as never, themeGateway as never);

    gateway.schedule(createThemeWithParams({ name: 'failed-theme' }), onError);
    await vi.advanceTimersByTimeAsync(400);
    const run = backgroundQueue.enqueue.mock.calls[0][2] as () => Promise<void>;
    await run();

    expect(onError).toHaveBeenCalledWith('disk full');
  });
});
