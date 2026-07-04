import { useCallback, useMemo } from 'react';


const ICONS = {
  'all': 'check_box',
  'some': 'indeterminate_check_box',
  'none': 'check_box_outline_blank',
};

const CHECKED: Record<TriState, boolean | 'mixed'> = {
  'all': true,
  'some': 'mixed',
  'none': false,
};

function getNextState(current: TriState): boolean {
  return current === 'some' ? true : current !== 'all';
}

/**
 * Tri-state value for bulk-selection checkboxes: fully selected, partially selected, or none.
 */
export type TriState = 'all' | 'none' | 'some';

interface TriStateCheckboxProps {
  state: TriState;
  onChange: (checked: boolean) => void;
  ariaLabel: string;
  className?: string;
}

/**
 * Renders an accessible tri-state checkbox that cycles between none, all, and some on activation.
 * @param props.state Current tri-state visual and ARIA checked value.
 * @param props.onChange Called with the next boolean checked value after a click or keyboard toggle.
 * @param props.ariaLabel Accessible name for the control.
 * @param props.className Optional extra CSS class names.
 * @returns The tri-state checkbox button element.
 */
export function TriStateCheckbox({
  state,
  ariaLabel,
  className,
  onChange,
}: TriStateCheckboxProps) {
  const icon = useMemo(() => ICONS[state], [state]);
  const ariaChecked = useMemo(() => CHECKED[state], [state]);

  const onClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(getNextState(state));
  }, [state, onChange]);

  const onKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      onChange(getNextState(state));
    }
  }, [state, onChange]);

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={ariaChecked}
      aria-label={ariaLabel}
      className={`checkbox-icon-btn ${className ?? ''}`.trim()}
      onClick={onClick}
      onKeyDown={onKeyDown}
    >
      <span className="material-symbols-outlined" aria-hidden>
        {icon}
      </span>
    </button>
  );
}
