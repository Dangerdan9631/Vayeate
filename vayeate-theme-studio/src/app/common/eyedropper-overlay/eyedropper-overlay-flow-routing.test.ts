import { describe, expect, it, vi } from 'vitest';
import type { LoggerFactory } from '../../../domain/utils/logger';
import { EyedropperOverlayHandler } from './actions/eyedropper-overlay-handler';
import { EyedropperOverlayActionType } from './actions/eyedropper-overlay-action-type';

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

describe('eyedropper overlay flow routing', () => {
  it('routes overlay actions to focused controllers', async () => {
    const closeEyedropperOverlay = { run: vi.fn() };
    const eyedropperOverlayWheelScroll = { run: vi.fn() };
    const eyedropperOverlayMouseMove = { run: vi.fn() };
    const eyedropperOverlayViewportSizeChange = { run: vi.fn() };
    const handler = new EyedropperOverlayHandler(
      closeEyedropperOverlay as never,
      eyedropperOverlayWheelScroll as never,
      eyedropperOverlayMouseMove as never,
      eyedropperOverlayViewportSizeChange as never,
      createLoggerFactory(),
    );

    await handler.handle({ type: EyedropperOverlayActionType.CancelButtonOnClick });
    await handler.handle({
      type: EyedropperOverlayActionType.ColorPickCommitButtonOnClick,
      hex: '#112233',
    });
    await handler.handle({
      type: EyedropperOverlayActionType.OverlayWheelOnScroll,
      deltaY: -16,
    });
    await handler.handle({
      type: EyedropperOverlayActionType.OverlayMouseMove,
      pointer: {
        clientPosition: { x: 30, y: 40 },
        canvasPosition: { x: 10, y: 20 },
        previewHex: '#abcdef',
      },
    });
    await handler.handle({
      type: EyedropperOverlayActionType.OverlayViewportSizeChange,
      size: { width: 1280, height: 720 },
    });

    expect(closeEyedropperOverlay.run).toHaveBeenNthCalledWith(1, null);
    expect(closeEyedropperOverlay.run).toHaveBeenNthCalledWith(2, '#112233');
    expect(eyedropperOverlayWheelScroll.run).toHaveBeenCalledWith(-16);
    expect(eyedropperOverlayMouseMove.run).toHaveBeenCalledWith({
      clientPosition: { x: 30, y: 40 },
      canvasPosition: { x: 10, y: 20 },
      previewHex: '#abcdef',
    });
    expect(eyedropperOverlayViewportSizeChange.run).toHaveBeenCalledWith({
      width: 1280,
      height: 720,
    });
  });
});
