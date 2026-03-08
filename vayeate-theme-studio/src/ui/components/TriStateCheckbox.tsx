import { useEffect, useRef } from 'react';

export type TriState = 'all' | 'none' | 'some';

interface TriStateCheckboxProps {
  state: TriState;
  onChange: (checked: boolean) => void;
  onClickCapture?: (e: React.MouseEvent) => void;
  ariaLabel: string;
  className?: string;
}

export function TriStateCheckbox({
  state,
  onChange,
  onClickCapture,
  ariaLabel,
  className,
}: TriStateCheckboxProps) {
  const ref = useRef<HTMLInputElement>(null);
  const checked = state === 'all';
  const indeterminate = state === 'some';

  useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate;
  }, [indeterminate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (indeterminate) {
      onChange(true);
    } else {
      onChange(e.target.checked);
    }
  };

  return (
    <input
      ref={ref}
      type="checkbox"
      className={className}
      checked={checked}
      onChange={handleChange}
      onClick={onClickCapture}
      aria-label={ariaLabel}
    />
  );
}
