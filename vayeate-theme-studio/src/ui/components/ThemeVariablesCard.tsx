import { useState } from 'react';
import type {
  ColorAssignment,
  ContrastAssignment,
  ContrastComparisonMethod,
  ContrastAssignmentValue,
  ContrastVariable,
} from '../../model/schemas';

interface ThemeVariablesCardProps {
  colorAssignments: readonly ColorAssignment[];
  contrastAssignments: readonly ContrastAssignment[];
  contrastVariables: readonly ContrastVariable[];
  orphanColorKeys: Set<string>;
  orphanContrastKeys: Set<string>;
  onUpdateColorDark: (colorRef: string, value: string | null) => void;
  onUpdateColorLight: (colorRef: string, value: string | null) => void;
  onUpdateColorUseDark: (colorRef: string, useDark: boolean) => void;
  onUpdateContrastDark: (contrastRef: string, field: keyof ContrastAssignmentValue, value: number | ContrastComparisonMethod | null) => void;
  onUpdateContrastLight: (contrastRef: string, field: keyof ContrastAssignmentValue, value: number | ContrastComparisonMethod | null) => void;
  onUpdateContrastUseDark: (contrastRef: string, useDark: boolean) => void;
}

const COMPARISON_OPTIONS: { value: ContrastComparisonMethod; label: string }[] = [
  { value: 'lessThan', label: '< Less than' },
  { value: 'equalTo', label: '= Equal to' },
  { value: 'greaterThan', label: '> Greater than' },
];

function ColorAssignmentsSection({
  assignments,
  orphanKeys,
  onUpdateDark,
  onUpdateLight,
  onUpdateUseDark,
}: {
  assignments: readonly ColorAssignment[];
  orphanKeys: Set<string>;
  onUpdateDark: (colorRef: string, value: string | null) => void;
  onUpdateLight: (colorRef: string, value: string | null) => void;
  onUpdateUseDark: (colorRef: string, useDark: boolean) => void;
}) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="tree-section">
      <button
        type="button"
        className="tree-header"
        onClick={() => setCollapsed(!collapsed)}
      >
        <span className="material-symbols-outlined tree-chevron">
          {collapsed ? 'chevron_right' : 'expand_more'}
        </span>
        <span className="tree-label">Color Variables</span>
        <span className="tree-count">({assignments.length})</span>
      </button>

      {!collapsed && (
        <div className="tree-children">
          {assignments.length === 0 && (
            <p className="empty-hint">No color variables</p>
          )}
          {assignments.map((a) => (
            <ColorAssignmentRow
              key={a.colorRef}
              assignment={a}
              isOrphan={orphanKeys.has(a.colorRef)}
              onUpdateDark={onUpdateDark}
              onUpdateLight={onUpdateLight}
              onUpdateUseDark={onUpdateUseDark}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ColorAssignmentRow({
  assignment,
  isOrphan,
  onUpdateDark,
  onUpdateLight,
  onUpdateUseDark,
}: {
  assignment: ColorAssignment;
  isOrphan: boolean;
  onUpdateDark: (colorRef: string, value: string | null) => void;
  onUpdateLight: (colorRef: string, value: string | null) => void;
  onUpdateUseDark: (colorRef: string, useDark: boolean) => void;
}) {
  const darkValue = assignment.dark?.value ?? '';
  const lightValue = assignment.light?.value ?? '';
  const [pendingDarkPicker, setPendingDarkPicker] = useState<string | null>(null);
  const [pendingLightPicker, setPendingLightPicker] = useState<string | null>(null);

  const displayDark = pendingDarkPicker ?? darkValue;
  const displayLight = assignment.useDarkForLight ? darkValue : (pendingLightPicker ?? lightValue);

  return (
    <div className={`theme-color-row ${isOrphan ? 'theme-row-orphan' : ''}`}>
      <span className="theme-var-name" title={assignment.colorRef}>
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
        value={darkValue}
        onChange={(e) => {
          const v = e.target.value.trim();
          onUpdateDark(assignment.colorRef, v || null);
        }}
      />
      <input
        type="color"
        className="theme-color-picker"
        value={displayDark || '#000000'}
        onChange={(e) => setPendingDarkPicker(e.target.value)}
        onBlur={(e) => {
          const v = e.target.value.trim() || null;
          onUpdateDark(assignment.colorRef, v);
          setPendingDarkPicker(null);
        }}
      />
      <input
        className="field-input theme-color-hex"
        type="text"
        placeholder="#ffffff"
        value={assignment.useDarkForLight ? darkValue : lightValue}
        disabled={assignment.useDarkForLight}
        onChange={(e) => {
          const v = e.target.value.trim();
          onUpdateLight(assignment.colorRef, v || null);
        }}
      />
      <input
        type="color"
        className="theme-color-picker"
        value={displayLight || '#ffffff'}
        disabled={assignment.useDarkForLight}
        onChange={(e) => setPendingLightPicker(e.target.value)}
        onBlur={(e) => {
          if (!assignment.useDarkForLight) {
            const v = e.target.value.trim() || null;
            onUpdateLight(assignment.colorRef, v);
          }
          setPendingLightPicker(null);
        }}
      />
      <label className="theme-use-dark-check" title="Use dark value for light theme">
        <span className="material-symbols-outlined theme-use-dark-icon" aria-hidden>join_left</span>
        <input
          type="checkbox"
          checked={assignment.useDarkForLight}
          onChange={(e) => onUpdateUseDark(assignment.colorRef, e.target.checked)}
        />
      </label>
    </div>
  );
}

function ContrastAssignmentsSection({
  assignments,
  contrastVariables,
  orphanKeys,
  onUpdateDark,
  onUpdateLight,
  onUpdateUseDark,
}: {
  assignments: readonly ContrastAssignment[];
  contrastVariables: readonly ContrastVariable[];
  orphanKeys: Set<string>;
  onUpdateDark: (contrastRef: string, field: keyof ContrastAssignmentValue, value: number | ContrastComparisonMethod | null) => void;
  onUpdateLight: (contrastRef: string, field: keyof ContrastAssignmentValue, value: number | ContrastComparisonMethod | null) => void;
  onUpdateUseDark: (contrastRef: string, useDark: boolean) => void;
}) {
  const [collapsed, setCollapsed] = useState(false);

  const varMap = new Map(contrastVariables.map((v) => [v.key, v]));

  return (
    <div className="tree-section">
      <button
        type="button"
        className="tree-header"
        onClick={() => setCollapsed(!collapsed)}
      >
        <span className="material-symbols-outlined tree-chevron">
          {collapsed ? 'chevron_right' : 'expand_more'}
        </span>
        <span className="tree-label">Contrast Variables</span>
        <span className="tree-count">({assignments.length})</span>
      </button>

      {!collapsed && (
        <div className="tree-children">
          {assignments.length === 0 && (
            <p className="empty-hint">No contrast variables</p>
          )}
          {assignments.map((a) => (
            <ContrastAssignmentRow
              key={a.contrastVariableRef}
              assignment={a}
              variable={varMap.get(a.contrastVariableRef) ?? null}
              isOrphan={orphanKeys.has(a.contrastVariableRef)}
              onUpdateDark={onUpdateDark}
              onUpdateLight={onUpdateLight}
              onUpdateUseDark={onUpdateUseDark}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ContrastAssignmentRow({
  assignment,
  variable,
  isOrphan,
  onUpdateDark,
  onUpdateLight,
  onUpdateUseDark,
}: {
  assignment: ContrastAssignment;
  variable: ContrastVariable | null;
  isOrphan: boolean;
  onUpdateDark: (contrastRef: string, field: keyof ContrastAssignmentValue, value: number | ContrastComparisonMethod | null) => void;
  onUpdateLight: (contrastRef: string, field: keyof ContrastAssignmentValue, value: number | ContrastComparisonMethod | null) => void;
  onUpdateUseDark: (contrastRef: string, useDark: boolean) => void;
}) {
  const ref = assignment.contrastVariableRef;
  const dark = assignment.dark;
  const light = assignment.light;

  return (
    <div className={`theme-contrast-block ${isOrphan ? 'theme-row-orphan' : ''}`}>
      <div className="theme-contrast-row1">
        <span className="theme-var-name" title={ref}>
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
        <label className="theme-use-dark-check" title="Use dark value for light theme">
          <span className="material-symbols-outlined theme-use-dark-icon" aria-hidden>join_left</span>
          <input
            type="checkbox"
            checked={assignment.useDarkForLight}
            onChange={(e) => onUpdateUseDark(ref, e.target.checked)}
          />
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
          value={dark?.value ?? ''}
          onChange={(e) => {
            const v = e.target.value ? parseFloat(e.target.value) : null;
            onUpdateDark(ref, 'value', v);
          }}
        />
        <select
          className="field-select theme-contrast-method"
          value={dark?.comparisonMethod ?? 'greaterThan'}
          onChange={(e) => onUpdateDark(ref, 'comparisonMethod', e.target.value as ContrastComparisonMethod)}
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
          value={assignment.useDarkForLight ? (dark?.value ?? '') : (light?.value ?? '')}
          disabled={assignment.useDarkForLight}
          onChange={(e) => {
            const v = e.target.value ? parseFloat(e.target.value) : null;
            onUpdateLight(ref, 'value', v);
          }}
        />
        <select
          className="field-select theme-contrast-method"
          value={assignment.useDarkForLight ? (dark?.comparisonMethod ?? 'greaterThan') : (light?.comparisonMethod ?? 'greaterThan')}
          disabled={assignment.useDarkForLight}
          onChange={(e) => onUpdateLight(ref, 'comparisonMethod', e.target.value as ContrastComparisonMethod)}
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
          value={dark?.min ?? ''}
          onChange={(e) => {
            const v = e.target.value ? parseFloat(e.target.value) : null;
            onUpdateDark(ref, 'min', v);
          }}
        />
        <input
          className="field-input theme-contrast-minmax"
          type="number"
          step="0.1"
          min="1"
          max="10"
          placeholder="Max"
          value={dark?.max ?? ''}
          onChange={(e) => {
            const v = e.target.value ? parseFloat(e.target.value) : null;
            onUpdateDark(ref, 'max', v);
          }}
        />
        <input
          className="field-input theme-contrast-minmax"
          type="number"
          step="0.1"
          min="1"
          max="10"
          placeholder="Min"
          value={assignment.useDarkForLight ? (dark?.min ?? '') : (light?.min ?? '')}
          disabled={assignment.useDarkForLight}
          onChange={(e) => {
            const v = e.target.value ? parseFloat(e.target.value) : null;
            onUpdateLight(ref, 'min', v);
          }}
        />
        <input
          className="field-input theme-contrast-minmax"
          type="number"
          step="0.1"
          min="1"
          max="10"
          placeholder="Max"
          value={assignment.useDarkForLight ? (dark?.max ?? '') : (light?.max ?? '')}
          disabled={assignment.useDarkForLight}
          onChange={(e) => {
            const v = e.target.value ? parseFloat(e.target.value) : null;
            onUpdateLight(ref, 'max', v);
          }}
        />
      </div>
    </div>
  );
}

export function ThemeVariablesCard({
  colorAssignments,
  contrastAssignments,
  contrastVariables,
  orphanColorKeys,
  orphanContrastKeys,
  onUpdateColorDark,
  onUpdateColorLight,
  onUpdateColorUseDark,
  onUpdateContrastDark,
  onUpdateContrastLight,
  onUpdateContrastUseDark,
}: ThemeVariablesCardProps) {
  return (
    <div className="tokens-card placeholder">
      <h2>Variables</h2>
      <ColorAssignmentsSection
        assignments={colorAssignments}
        orphanKeys={orphanColorKeys}
        onUpdateDark={onUpdateColorDark}
        onUpdateLight={onUpdateColorLight}
        onUpdateUseDark={onUpdateColorUseDark}
      />
      <ContrastAssignmentsSection
        assignments={contrastAssignments}
        contrastVariables={contrastVariables}
        orphanKeys={orphanContrastKeys}
        onUpdateDark={onUpdateContrastDark}
        onUpdateLight={onUpdateContrastLight}
        onUpdateUseDark={onUpdateContrastUseDark}
      />
    </div>
  );
}
