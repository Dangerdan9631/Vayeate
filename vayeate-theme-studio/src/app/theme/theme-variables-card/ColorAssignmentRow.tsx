import { memo, useState, type ChangeEvent, type FocusEvent, type KeyboardEvent } from 'react';
import type { ColorAssignment } from '../../../model/schema/theme-schemas';

export interface ColorAssignmentRowProps {
  assignment: ColorAssignment;
  isOrphan: boolean;
  checked: boolean;
  onToggleChecked: (ref: string) => void;
  onUpdateDark: (colorRef: string, value: string | null) => void;
  onUpdateLight: (colorRef: string, value: string | null) => void;
  onUpdateUseDark: (colorRef: string, useDark: boolean) => void;
  onDarkEyedropperClick: (colorRef: string) => void;
  onLightEyedropperClick: (colorRef: string) => void;
}

function ColorAssignmentRowComponent({
  assignment,
  isOrphan,
  checked,
  onToggleChecked,
  onUpdateDark,
  onUpdateLight,
  onUpdateUseDark,
  onDarkEyedropperClick,
  onLightEyedropperClick,
}: ColorAssignmentRowProps) {
  const darkValue = assignment.dark?.value ?? '';
  const lightValue = assignment.light?.value ?? '';
  const [pendingDarkPicker, setPendingDarkPicker] = useState<string | null>(null);
  const [pendingLightPicker, setPendingLightPicker] = useState<string | null>(null);
  const [pendingDarkHex, setPendingDarkHex] = useState<string | null>(null);
  const [pendingLightHex, setPendingLightHex] = useState<string | null>(null);

  const displayDark = pendingDarkPicker ?? darkValue;
  const displayLight = assignment.useDarkForLight ? darkValue : (pendingLightPicker ?? lightValue);
  const displayDarkHex = pendingDarkHex ?? darkValue;
  const displayLightHex = assignment.useDarkForLight ? darkValue : (pendingLightHex ?? lightValue);
  const pickerValueDark = (displayDark.length === 9 ? displayDark.slice(0, 7) : displayDark) || '#000000';
  const pickerValueLight = (displayLight.length === 9 ? displayLight.slice(0, 7) : displayLight) || '#ffffff';
  const hasGenerationIssue =
    assignment.dark === null || (!assignment.useDarkForLight && assignment.light === null);

  function onColorRowToggleClick() {
    onToggleChecked(assignment.colorRef);
  }

  function onColorRowToggleKeyDown(e: KeyboardEvent<HTMLButtonElement>) {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      onToggleChecked(assignment.colorRef);
    }
  }

  function onDarkHexInputChange(e: ChangeEvent<HTMLInputElement>) {
    setPendingDarkHex(e.target.value);
  }

  function onDarkHexInputBlur(e: FocusEvent<HTMLInputElement>) {
    const v = e.target.value.trim() || null;
    onUpdateDark(assignment.colorRef, v);
    setPendingDarkHex(null);
  }

  function onDarkPickerInputChange(e: ChangeEvent<HTMLInputElement>) {
    setPendingDarkPicker(e.target.value);
  }

  function onDarkPickerInputBlur(e: FocusEvent<HTMLInputElement>) {
    let v = e.target.value.trim() || null;
    if (v && darkValue.length === 9) v = v + darkValue.slice(7, 9);
    onUpdateDark(assignment.colorRef, v);
    setPendingDarkPicker(null);
  }

  function onDarkEyedropperButtonClick() {
    onDarkEyedropperClick(assignment.colorRef);
  }

  function onLightHexInputChange(e: ChangeEvent<HTMLInputElement>) {
    setPendingLightHex(e.target.value);
  }

  function onLightHexInputBlur(e: FocusEvent<HTMLInputElement>) {
    if (!assignment.useDarkForLight) {
      const v = e.target.value.trim() || null;
      onUpdateLight(assignment.colorRef, v);
    }
    setPendingLightHex(null);
  }

  function onLightPickerInputChange(e: ChangeEvent<HTMLInputElement>) {
    setPendingLightPicker(e.target.value);
  }

  function onLightPickerInputBlur() {
    if (!assignment.useDarkForLight) {
      let v = (pendingLightPicker ?? lightValue) || null;
      if (v && lightValue.length === 9) v = v + lightValue.slice(7, 9);
      onUpdateLight(assignment.colorRef, v);
    }
    setPendingLightPicker(null);
  }

  function onLightEyedropperButtonClick() {
    if (assignment.useDarkForLight) return;
    onLightEyedropperClick(assignment.colorRef);
  }

  function onUseDarkForLightCheckboxChange(e: ChangeEvent<HTMLInputElement>) {
    onUpdateUseDark(assignment.colorRef, e.target.checked);
  }

  return (
    <div
      className={`theme-color-row theme-color-row--has-eyedropper ${isOrphan ? 'theme-row-orphan' : ''}`}
    >
      <button
        type="button"
        role="checkbox"
        aria-checked={checked}
        aria-label={`Include ${assignment.colorRef} in palette adjustments`}
        title="Include in palette adjustments"
        className="theme-var-check-wrap checkbox-icon-btn"
        onClick={onColorRowToggleClick}
        onKeyDown={onColorRowToggleKeyDown}
      >
        <span className="material-symbols-outlined" aria-hidden>
          {checked ? 'check_box' : 'check_box_outline_blank'}
        </span>
      </button>
      <span
        className={`theme-var-name ${hasGenerationIssue ? 'theme-var-name--blocking' : ''}`}
        title={assignment.colorRef}
      >
        {assignment.colorRef}
        {isOrphan && (
          <span className="material-symbols-outlined mapping-warning-icon" title="Variable not in template">
            warning
          </span>
        )}
      </span>
      <input
        className="field-input theme-color-hex"
        type="text"
        placeholder="#000000"
        value={displayDarkHex}
        onChange={onDarkHexInputChange}
        onBlur={onDarkHexInputBlur}
      />
      <input
        type="color"
        className="theme-color-picker"
        value={pickerValueDark}
        onChange={onDarkPickerInputChange}
        onBlur={onDarkPickerInputBlur}
      />
      <button
        type="button"
        className="theme-eyedropper-btn"
        title="Pick color from screen (dark)"
        aria-label="Pick dark color from screen"
        onClick={onDarkEyedropperButtonClick}
      >
        <span className="material-symbols-outlined" aria-hidden>colorize</span>
      </button>
      <input
        className="field-input theme-color-hex"
        type="text"
        placeholder="#ffffff"
        value={displayLightHex}
        disabled={assignment.useDarkForLight}
        onChange={onLightHexInputChange}
        onBlur={onLightHexInputBlur}
      />
      <input
        type="color"
        className="theme-color-picker"
        value={pickerValueLight}
        disabled={assignment.useDarkForLight}
        onChange={onLightPickerInputChange}
        onBlur={onLightPickerInputBlur}
      />
      <button
        type="button"
        className="theme-eyedropper-btn"
        disabled={assignment.useDarkForLight}
        title="Pick color from screen (light)"
        aria-label="Pick light color from screen"
        onClick={onLightEyedropperButtonClick}
      >
        <span className="material-symbols-outlined" aria-hidden>colorize</span>
      </button>
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
          onChange={onUseDarkForLightCheckboxChange}
          aria-label="Use dark value for light theme"
        />
        <span className="material-symbols-outlined theme-use-dark-icon" aria-hidden>join_left</span>
      </label>
    </div>
  );
}

export const ColorAssignmentRow = memo(ColorAssignmentRowComponent);
