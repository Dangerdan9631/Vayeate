import { memo, useState, type ChangeEvent, type FocusEvent, type KeyboardEvent } from 'react';
import type { ContrastComparisonMethod } from '../../../model/schema/primitives';
import type { ContrastVariable } from '../../../model/schema/template-schemas';
import type { ContrastAssignment, ContrastAssignmentValue } from '../../../model/schema/theme-schemas';

const COMPARISON_OPTIONS: { value: ContrastComparisonMethod; label: string }[] = [
  { value: 'lessThan', label: '< Less than' },
  { value: 'equalTo', label: '= Equal to' },
  { value: 'greaterThan', label: '> Greater than' },
];

export interface ContrastAssignmentRowProps {
  assignment: ContrastAssignment;
  variable: ContrastVariable | null;
  isOrphan: boolean;
  checked: boolean;
  onToggleChecked: (ref: string) => void;
  onUpdateDark: (contrastRef: string, field: keyof ContrastAssignmentValue, value: number | ContrastComparisonMethod | null) => void;
  onUpdateLight: (contrastRef: string, field: keyof ContrastAssignmentValue, value: number | ContrastComparisonMethod | null) => void;
  onUpdateUseDark: (contrastRef: string, useDark: boolean) => void;
}

function ContrastAssignmentRowComponent({
  assignment,
  variable,
  isOrphan,
  checked,
  onToggleChecked,
  onUpdateDark,
  onUpdateLight,
  onUpdateUseDark,
}: ContrastAssignmentRowProps) {
  const ref = assignment.contrastVariableRef;
  const dark = assignment.dark;
  const light = assignment.light;

  const [editValueDark, setEditValueDark] = useState<string | null>(null);
  const [editValueLight, setEditValueLight] = useState<string | null>(null);
  const [editMinDark, setEditMinDark] = useState<string | null>(null);
  const [editMaxDark, setEditMaxDark] = useState<string | null>(null);
  const [editMinLight, setEditMinLight] = useState<string | null>(null);
  const [editMaxLight, setEditMaxLight] = useState<string | null>(null);

  const hasGenerationIssue =
    assignment.dark === null || (!assignment.useDarkForLight && assignment.light === null);

  function onContrastRowToggleClick() {
    onToggleChecked(ref);
  }

  function onContrastRowToggleKeyDown(e: KeyboardEvent<HTMLButtonElement>) {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      onToggleChecked(ref);
    }
  }

  function onContrastUseDarkCheckboxChange(e: ChangeEvent<HTMLInputElement>) {
    onUpdateUseDark(ref, e.target.checked);
  }

  function onContrastValueDarkInputChange(e: ChangeEvent<HTMLInputElement>) {
    setEditValueDark(e.target.value);
  }

  function onContrastValueDarkInputBlur(e: FocusEvent<HTMLInputElement>) {
    const v = e.target.value ? parseFloat(e.target.value) : null;
    onUpdateDark(ref, 'value', v);
    setEditValueDark(null);
  }

  function onContrastMethodDarkSelectChange(e: ChangeEvent<HTMLSelectElement>) {
    onUpdateDark(ref, 'comparisonMethod', e.target.value as ContrastComparisonMethod);
  }

  function onContrastValueLightInputChange(e: ChangeEvent<HTMLInputElement>) {
    setEditValueLight(e.target.value);
  }

  function onContrastValueLightInputBlur(e: FocusEvent<HTMLInputElement>) {
    if (!assignment.useDarkForLight) {
      const v = e.target.value ? parseFloat(e.target.value) : null;
      onUpdateLight(ref, 'value', v);
    }
    setEditValueLight(null);
  }

  function onContrastMethodLightSelectChange(e: ChangeEvent<HTMLSelectElement>) {
    onUpdateLight(ref, 'comparisonMethod', e.target.value as ContrastComparisonMethod);
  }

  function onContrastMinDarkInputChange(e: ChangeEvent<HTMLInputElement>) {
    setEditMinDark(e.target.value);
  }

  function onContrastMinDarkInputBlur(e: FocusEvent<HTMLInputElement>) {
    const v = e.target.value ? parseFloat(e.target.value) : null;
    onUpdateDark(ref, 'min', v);
    setEditMinDark(null);
  }

  function onContrastMaxDarkInputChange(e: ChangeEvent<HTMLInputElement>) {
    setEditMaxDark(e.target.value);
  }

  function onContrastMaxDarkInputBlur(e: FocusEvent<HTMLInputElement>) {
    const v = e.target.value ? parseFloat(e.target.value) : null;
    onUpdateDark(ref, 'max', v);
    setEditMaxDark(null);
  }

  function onContrastMinLightInputChange(e: ChangeEvent<HTMLInputElement>) {
    setEditMinLight(e.target.value);
  }

  function onContrastMinLightInputBlur(e: FocusEvent<HTMLInputElement>) {
    if (!assignment.useDarkForLight) {
      const v = e.target.value ? parseFloat(e.target.value) : null;
      onUpdateLight(ref, 'min', v);
    }
    setEditMinLight(null);
  }

  function onContrastMaxLightInputChange(e: ChangeEvent<HTMLInputElement>) {
    setEditMaxLight(e.target.value);
  }

  function onContrastMaxLightInputBlur(e: FocusEvent<HTMLInputElement>) {
    if (!assignment.useDarkForLight) {
      const v = e.target.value ? parseFloat(e.target.value) : null;
      onUpdateLight(ref, 'max', v);
    }
    setEditMaxLight(null);
  }

  return (
    <div className={`theme-contrast-block ${isOrphan ? 'theme-row-orphan' : ''}`}>
      <div className="theme-contrast-row1">
        <button
          type="button"
          role="checkbox"
          aria-checked={checked}
          aria-label={`Include ${ref} in palette adjustments`}
          title="Include in palette adjustments"
          className="theme-var-check-wrap checkbox-icon-btn"
          onClick={onContrastRowToggleClick}
          onKeyDown={onContrastRowToggleKeyDown}
        >
          <span className="material-symbols-outlined" aria-hidden>
            {checked ? 'check_box' : 'check_box_outline_blank'}
          </span>
        </button>
        <span
          className={`theme-var-name ${hasGenerationIssue ? 'theme-var-name--blocking' : ''}`}
          title={ref}
        >
          {ref}
          {isOrphan && (
            <span className="material-symbols-outlined mapping-warning-icon" title="Variable not in template">
              warning
            </span>
          )}
        </span>
        <span className="theme-contrast-source-wrap">
          <span className="theme-contrast-source-label">Source:</span>
          <span className="theme-contrast-source">
            {variable?.comparisonSourceRef ?? '—'}
          </span>
        </span>
        <label
          className="theme-use-dark-check theme-icon-checkbox"
          title={
            assignment.useDarkForLight
              ? 'Use dark value for light theme. Currently on.'
              : 'Use dark value for light theme. Currently off. Click to use the same value for light as dark.'
          }
        >
          <input
            type="checkbox"
            checked={assignment.useDarkForLight}
            onChange={onContrastUseDarkCheckboxChange}
            aria-label="Use dark value for light theme"
          />
          <span className="material-symbols-outlined theme-use-dark-icon" aria-hidden>join_left</span>
        </label>
      </div>

      <div className="theme-contrast-row-labels">
        <span className="theme-contrast-dark-label">dark</span>
        <span className="theme-contrast-light-label">light</span>
      </div>

      <div className="theme-contrast-row2">
        <input
          className="field-input theme-contrast-value"
          type="number"
          step="0.1"
          min="1"
          max="10"
          placeholder="Value"
          value={editValueDark ?? (dark?.value ?? '')}
          onChange={onContrastValueDarkInputChange}
          onBlur={onContrastValueDarkInputBlur}
        />
        <select
          className="field-select theme-contrast-method"
          value={dark?.comparisonMethod ?? 'greaterThan'}
          onChange={onContrastMethodDarkSelectChange}
        >
          {COMPARISON_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <input
          className="field-input theme-contrast-value"
          type="number"
          step="0.1"
          min="1"
          max="10"
          placeholder="Value"
          value={assignment.useDarkForLight ? (dark?.value ?? '') : (editValueLight ?? (light?.value ?? ''))}
          disabled={assignment.useDarkForLight}
          onChange={onContrastValueLightInputChange}
          onBlur={onContrastValueLightInputBlur}
        />
        <select
          className="field-select theme-contrast-method"
          value={assignment.useDarkForLight ? (dark?.comparisonMethod ?? 'greaterThan') : (light?.comparisonMethod ?? 'greaterThan')}
          disabled={assignment.useDarkForLight}
          onChange={onContrastMethodLightSelectChange}
        >
          {COMPARISON_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      <div className="theme-contrast-row3">
        <input
          className="field-input theme-contrast-minmax"
          type="number"
          step="0.1"
          min="1"
          max="10"
          placeholder="Min"
          value={editMinDark ?? (dark?.min ?? '')}
          onChange={onContrastMinDarkInputChange}
          onBlur={onContrastMinDarkInputBlur}
        />
        <input
          className="field-input theme-contrast-minmax"
          type="number"
          step="0.1"
          min="1"
          max="10"
          placeholder="Max"
          value={editMaxDark ?? (dark?.max ?? '')}
          onChange={onContrastMaxDarkInputChange}
          onBlur={onContrastMaxDarkInputBlur}
        />
        <input
          className="field-input theme-contrast-minmax"
          type="number"
          step="0.1"
          min="1"
          max="10"
          placeholder="Min"
          value={assignment.useDarkForLight ? (dark?.min ?? '') : (editMinLight ?? (light?.min ?? ''))}
          disabled={assignment.useDarkForLight}
          onChange={onContrastMinLightInputChange}
          onBlur={onContrastMinLightInputBlur}
        />
        <input
          className="field-input theme-contrast-minmax"
          type="number"
          step="0.1"
          min="1"
          max="10"
          placeholder="Max"
          value={assignment.useDarkForLight ? (dark?.max ?? '') : (editMaxLight ?? (light?.max ?? ''))}
          disabled={assignment.useDarkForLight}
          onChange={onContrastMaxLightInputChange}
          onBlur={onContrastMaxLightInputBlur}
        />
      </div>
    </div>
  );
}

export const ContrastAssignmentRow = memo(ContrastAssignmentRowComponent);
