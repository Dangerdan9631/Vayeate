import { describe, expect, it, vi } from 'vitest';
import type { LoggerFactory } from '../../../domain/utils/logger';
import { StyledTooltipHandler } from './actions/styled-tooltip-handler';
import { StyledTooltipActionType } from './actions/styled-tooltip-action-type';

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

describe('styled tooltip flow routing', () => {
  it('routes tooltip actions to focused controllers', async () => {
    const showStyledTooltip = { run: vi.fn() };
    const hideStyledTooltip = { run: vi.fn() };
    const repositionStyledTooltip = { run: vi.fn() };
    const handler = new StyledTooltipHandler(
      showStyledTooltip as never,
      hideStyledTooltip as never,
      repositionStyledTooltip as never,
      createLoggerFactory(),
    );

    await handler.handle({
      type: StyledTooltipActionType.TooltipSourceOnMouseOver,
      tooltip: { text: 'Open settings', x: 10, y: 20 },
    });
    await handler.handle({
      type: StyledTooltipActionType.TooltipOnPositionChange,
      position: { x: 12, y: 24 },
    });
    await handler.handle({
      type: StyledTooltipActionType.TooltipSourceOnMouseOut,
    });

    expect(showStyledTooltip.run).toHaveBeenCalledWith({ text: 'Open settings', x: 10, y: 20 });
    expect(repositionStyledTooltip.run).toHaveBeenCalledWith({ x: 12, y: 24 });
    expect(hideStyledTooltip.run).toHaveBeenCalledTimes(1);
  });
});
