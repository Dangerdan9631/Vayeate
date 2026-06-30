import { memo, type ChangeEvent } from 'react';
import type { StyleAssignment, StyleAssignmentValue } from '../../../model/schema/theme-schemas';

const STYLE_FIELDS: { field: keyof StyleAssignmentValue; label: string }[] = [
  { field: 'bold', label: 'B' },
  { field: 'underline', label: 'U' },
  { field: 'italic', label: 'I' },
  { field: 'strikethrough', label: 'S' },
];

/**
 * Props consumed by the Style Assignment Row component.
 */
export interface StyleAssignmentRowProps {
  assignment: StyleAssignment;
  onUpdateField: (styleRef: string, side: 'light' | 'dark', field: keyof StyleAssignmentValue, checked: boolean) => void;
  onUpdateUseDark: (styleRef: string, useDark: boolean) => void;
}

function StyleAssignmentRowComponent({
  assignment,
  onUpdateField,
  onUpdateUseDark,
}: StyleAssignmentRowProps) {
  const ref = assignment.styleVariableRef;
  const dark = assignment.dark;
  const light = assignment.light;

  function onStyleUseDarkCheckboxChange(e: ChangeEvent<HTMLInputElement>) {
    onUpdateUseDark(ref, e.target.checked);
  }

  function onDarkFieldChange(e: ChangeEvent<HTMLInputElement>) {
    onUpdateField(ref, 'dark', e.target.name as keyof StyleAssignmentValue, e.target.checked);
  }

  function onLightFieldChange(e: ChangeEvent<HTMLInputElement>) {
    if (assignment.useDarkForLight) return;
    onUpdateField(ref, 'light', e.target.name as keyof StyleAssignmentValue, e.target.checked);
  }

  return (
    <div className="theme-style-row">
      <span className="theme-var-name theme-style-var-name" title={ref}>{ref}</span>
      <div className="theme-style-side-group" role="group" aria-label={`${ref} dark style values`}>
        <span className="theme-style-side-label">dark</span>
        <div className="theme-style-field-group">
          {STYLE_FIELDS.map(({ field, label }) => (
            <label key={`dark-${field}`} className="theme-style-field-check theme-icon-checkbox" title={`Dark ${field}`}>
              <input
                type="checkbox"
                name={field}
                checked={dark?.[field] ?? false}
                onChange={onDarkFieldChange}
                aria-label={`${ref} dark ${field}`}
              />
              <span>{label}</span>
            </label>
          ))}
        </div>
      </div>
      <div className="theme-style-side-group" role="group" aria-label={`${ref} light style values`}>
        <span className="theme-style-side-label">light</span>
        <div className="theme-style-field-group">
          {STYLE_FIELDS.map(({ field, label }) => (
            <label
              key={`light-${field}`}
              className="theme-style-field-check theme-icon-checkbox"
              title={`Light ${field}`}
            >
              <input
                type="checkbox"
                name={field}
                checked={assignment.useDarkForLight ? (dark?.[field] ?? false) : (light?.[field] ?? false)}
                disabled={assignment.useDarkForLight}
                onChange={onLightFieldChange}
                aria-label={`${ref} light ${field}`}
              />
              <span>{label}</span>
            </label>
          ))}
        </div>
      </div>
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
          onChange={onStyleUseDarkCheckboxChange}
          aria-label="Use dark value for light theme"
        />
        <span className="material-symbols-outlined theme-use-dark-icon" aria-hidden>join_left</span>
      </label>
    </div>
  );
}

/**
 * Memoized Style Assignment Row component for the theme UI.
 */
export const StyleAssignmentRow = memo(StyleAssignmentRowComponent);
