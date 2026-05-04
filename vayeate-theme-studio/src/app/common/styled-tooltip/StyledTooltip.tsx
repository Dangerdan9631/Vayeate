import { useStyledTooltipViewModel } from './use-styled-tooltip-viewmodel';

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
