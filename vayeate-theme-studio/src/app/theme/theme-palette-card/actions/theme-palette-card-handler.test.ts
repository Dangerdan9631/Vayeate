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
  const setThemeSaturationAdjustment = { run: vi.fn() };
  const setThemeValueAdjustment = { run: vi.fn() };
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
    setThemeSaturationAdjustment as never,
    setThemeValueAdjustment as never,
    { run: vi.fn() } as never,
    createLoggerFactory(),
  );
  return {
    handler,
    setThemeHueAdjustment,
    setThemeSaturationAdjustment,
    setThemeValueAdjustment,
    computePaletteClusters,
  };
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

describe('ThemePaletteCardHandler saturation and value sliders', () => {
  it('applies deferred preview on saturation delta without recomputing clusters', async () => {
    const { handler, setThemeSaturationAdjustment, computePaletteClusters } = buildHandler();

    await handler.handle({ type: ThemePaletteCardActionType.SaturationSliderOnDelta, value: 12 });

    expect(setThemeSaturationAdjustment.run).toHaveBeenCalledWith(12, { deferPreview: true });
    expect(computePaletteClusters.run).not.toHaveBeenCalled();
  });

  it('commits saturation preview and recomputes clusters once on slider commit', async () => {
    const { handler, setThemeSaturationAdjustment, computePaletteClusters } = buildHandler();

    await handler.handle({ type: ThemePaletteCardActionType.SaturationSliderOnCommit, value: 35 });

    expect(setThemeSaturationAdjustment.run).toHaveBeenCalledWith(35, { deferPreview: false });
    expect(computePaletteClusters.run).toHaveBeenCalledTimes(1);
  });

  it('applies deferred preview on value delta without recomputing clusters', async () => {
    const { handler, setThemeValueAdjustment, computePaletteClusters } = buildHandler();

    await handler.handle({ type: ThemePaletteCardActionType.ValueSliderOnDelta, value: -12 });

    expect(setThemeValueAdjustment.run).toHaveBeenCalledWith(-12, { deferPreview: true });
    expect(computePaletteClusters.run).not.toHaveBeenCalled();
  });

  it('commits value preview and recomputes clusters once on slider commit', async () => {
    const { handler, setThemeValueAdjustment, computePaletteClusters } = buildHandler();

    await handler.handle({ type: ThemePaletteCardActionType.ValueSliderOnCommit, value: -35 });

    expect(setThemeValueAdjustment.run).toHaveBeenCalledWith(-35, { deferPreview: false });
    expect(computePaletteClusters.run).toHaveBeenCalledTimes(1);
  });
});
