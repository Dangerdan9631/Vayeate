import { useStyledTooltipViewModel } from './use-styled-tooltip-viewmodel';

/**
 * Renders the global styled tooltip overlay when tooltip UI state is active.
 * @returns The positioned tooltip element, or null when hidden.
 */
export function StyledTooltip() {
  const { state, tooltipRef } = useStyledTooltipViewModel();

  if (!state) return null;

  return (
    <div
      ref={tooltipRef}
      className="app-tooltip"
      role="tooltip"
      style={{
        left: state.x,
        top: state.y,
      }}
    >
      {state.text}
    </div>
  );
}
