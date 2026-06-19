import { describe, expect, it, vi } from 'vitest';
import { ThemePaletteCardHandler } from './theme-palette-card-handler';
import { ThemePaletteCardActionType } from './theme-palette-card-action-type';
import type { LoggerFactory } from '../../../../domain/utils/logger';

function createLoggerFactory(): LoggerFactory {
  return {
    create: () => ({
      debug: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      category: 'test',
    }),
  } as unknown as LoggerFactory;
}

function buildHandler() {
  const setThemeHueAdjustment = { run: vi.fn() };
  const computePaletteClusters = { run: vi.fn(async () => undefined) };
  const handler = new ThemePaletteCardHandler(
    { run: vi.fn() } as never,
    { run: vi.fn() } as never,
    { run: vi.fn() } as never,
    { run: vi.fn() } as never,
    { run: vi.fn() } as never,
    { run: vi.fn() } as never,
    { run: vi.fn() } as never,
    { run: vi.fn() } as never,
    { run: vi.fn() } as never,
    { run: vi.fn() } as never,
    { run: vi.fn() } as never,
    computePaletteClusters as never,
    { run: vi.fn() } as never,
    setThemeHueAdjustment as never,
    { run: vi.fn() } as never,
    createLoggerFactory(),
  );
  return { handler, setThemeHueAdjustment, computePaletteClusters };
}

describe('ThemePaletteCardHandler hue slider', () => {
  it('applies deferred preview on delta without recomputing clusters', async () => {
    const { handler, setThemeHueAdjustment, computePaletteClusters } = buildHandler();

    await handler.handle({ type: ThemePaletteCardActionType.HueSliderOnDelta, value: 12 });

    expect(setThemeHueAdjustment.run).toHaveBeenCalledWith(12, { deferPreview: true });
    expect(computePaletteClusters.run).not.toHaveBeenCalled();
  });

  it('commits preview and recomputes clusters once on slider commit', async () => {
    const { handler, setThemeHueAdjustment, computePaletteClusters } = buildHandler();

    await handler.handle({ type: ThemePaletteCardActionType.HueSliderOnCommit, value: 35 });

    expect(setThemeHueAdjustment.run).toHaveBeenCalledWith(35, { deferPreview: false });
    expect(computePaletteClusters.run).toHaveBeenCalledTimes(1);
  });
});
