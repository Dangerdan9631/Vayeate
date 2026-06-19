import { describe, expect, it, vi } from 'vitest';
import * as scheduler from './scheduler';

describe('scheduler', () => {
  it('yieldToEventLoop resolves on a subsequent macrotask', async () => {
    const order: string[] = [];
    order.push('sync');
    void scheduler.yieldToEventLoop().then(() => {
      order.push('yielded');
    });
    order.push('after-schedule');

    await vi.waitFor(() => {
      expect(order).toEqual(['sync', 'after-schedule', 'yielded']);
    });
  });

  it('createYieldEvery does not yield before the interval is reached', async () => {
    const yieldFn = vi.fn(async () => {});
    const gate = scheduler.createYieldEvery(3, yieldFn);

    await gate();
    await gate();

    expect(yieldFn).not.toHaveBeenCalled();

    await gate();
    expect(yieldFn).toHaveBeenCalledTimes(1);
  });

  it('createYieldEvery yields on every nth call', async () => {
    const yieldFn = vi.fn(async () => {});
    const gate = scheduler.createYieldEvery(2, yieldFn);

    await gate();
    expect(yieldFn).not.toHaveBeenCalled();

    await gate();
    expect(yieldFn).toHaveBeenCalledTimes(1);

    await gate();
    expect(yieldFn).toHaveBeenCalledTimes(1);

    await gate();
    expect(yieldFn).toHaveBeenCalledTimes(2);
  });

  it('yieldEvery rejects non-positive intervals', () => {
    expect(() => scheduler.yieldEvery(0)).toThrow(RangeError);
    expect(() => scheduler.yieldEvery(-1)).toThrow(RangeError);
  });
});
