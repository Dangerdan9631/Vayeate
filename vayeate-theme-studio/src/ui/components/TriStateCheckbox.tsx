import { useCallback } from 'react';

export type TriState = 'all' | 'none' | 'some';

interface TriStateCheckboxProps {
  state: TriState;
  onChange: (checked: boolean) => void;
  onClickCapture?: (e: React.MouseEvent) => void;
  ariaLabel: string;
  className?: string;
}

const ICON_ALL = 'check_box';
const ICON_SOME = 'indeterminate_check_box';
const ICON_NONE = 'check_box_outline_blank';

export function TriStateCheckbox({
  state,
  onChange,
  onClickCapture,
  ariaLabel,
  className,
}: TriStateCheckboxProps) {
  const icon =
    state === 'all' ? ICON_ALL : state === 'some' ? ICON_SOME : ICON_NONE;
  const ariaChecked =
    state === 'all' ? true : state === 'some' ? ('mixed' as const) : false;

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      onClickCapture?.(e);
      if (state === 'some') {
        onChange(true);
      } else {
        onChange(state !== 'all');
      }
    },
    [state, onChange, onClickCapture],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        if (state === 'some') {
          onChange(true);
        } else {
          onChange(state !== 'all');
        }
      }
    },
    [state, onChange],
  );

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={ariaChecked}
      aria-label={ariaLabel}
      className={`checkbox-icon-btn ${className ?? ''}`.trim()}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      <span className="material-symbols-outlined" aria-hidden>
        {icon}
      </span>
    </button>
  );
}
