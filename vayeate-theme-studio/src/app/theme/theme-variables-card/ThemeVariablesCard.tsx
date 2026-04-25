import { useMemo, useState, type ChangeEvent, type FocusEvent, type KeyboardEvent } from 'react';
import type { ContrastComparisonMethod } from '../../../model/schema/primitives';
import type { ColorVariable, ContrastVariable } from '../../../model/schema/template-schemas';
import type { ColorAssignment, ContrastAssignment, ContrastAssignmentValue } from '../../../model/schema/theme-schemas';
import { useThemeVariablesCardViewModel } from './use-theme-variables-card-viewmodel';
import { TriStateCheckbox, type TriState } from '../../common/tristate-checkbox/TriStateCheckbox';

const UNGROUPED_KEY = '__ungrouped__';

const COMPARISON_OPTIONS: { value: ContrastComparisonMethod; label: string }[] = [
  { value: 'lessThan', label: '< Less than' },
  { value: 'equalTo', label: '= Equal to' },
  { value: 'greaterThan', label: '> Greater than' },
];

function sortedGroupKeys(byGroup: Map<string, unknown[]>): string[] {
  const named = [...byGroup.keys()].filter((k) => k !== UNGROUPED_KEY).sort();
  const hasUngrouped = byGroup.has(UNGROUPED_KEY);
  return hasUngrouped ? [...named, UNGROUPED_KEY] : named;
}

function buildColorAssignmentsByGroup(
  assignments: readonly ColorAssignment[],
  colorVariables: readonly ColorVariable[],
): Map<string, ColorAssignment[]> {
  const varMap = new Map(colorVariables.map((v) => [v.key, v]));
  const byGroup = new Map<string, ColorAssignment[]>();
  for (const a of assignments) {
    const groupRef = varMap.get(a.colorRef)?.groupRef ?? null;
    const groupKey = groupRef ?? UNGROUPED_KEY;
    let list = byGroup.get(groupKey);
    if (!list) {
      list = [];
      byGroup.set(groupKey, list);
    }
    list.push(a);
  }
  return byGroup;
}

function buildContrastAssignmentsByGroup(
  assignments: readonly ContrastAssignment[],
  contrastVariables: readonly ContrastVariable[],
): Map<string, ContrastAssignment[]> {
  const varMap = new Map(contrastVariables.map((v) => [v.key, v]));
  const byGroup = new Map<string, ContrastAssignment[]>();
  for (const a of assignments) {
    const groupRef = varMap.get(a.contrastVariableRef)?.groupRef ?? null;
    const groupKey = groupRef ?? UNGROUPED_KEY;
    let list = byGroup.get(groupKey);
    if (!list) {
      list = [];
      byGroup.set(groupKey, list);
    }
    list.push(a);
  }
  return byGroup;
}

function ColorAssignmentsSection({
  assignments,
  colorVariables,
  orphanKeys,
  checkedColorRefs,
  onToggleColorChecked,
  sectionState,
  onSetAllColorChecked,
  onSetColorGroupChecked,
  onUpdateDark,
  onUpdateLight,
  onUpdateUseDark,
  onDarkEyedropperClick,
  onLightEyedropperClick,
}: {
  assignments: readonly ColorAssignment[];
  colorVariables: readonly ColorVariable[];
  orphanKeys: Set<string>;
  checkedColorRefs: ReadonlySet<string>;
  onToggleColorChecked: (ref: string) => void;
  sectionState: TriState;
  onSetAllColorChecked: (checked: boolean) => void;
  onSetColorGroupChecked: (groupKey: string, checked: boolean) => void;
  onUpdateDark: (colorRef: string, value: string | null) => void;
  onUpdateLight: (colorRef: string, value: string | null) => void;
  onUpdateUseDark: (colorRef: string, useDark: boolean) => void;
  onDarkEyedropperClick: (colorRef: string) => void;
  onLightEyedropperClick: (colorRef: string) => void;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const byGroup = useMemo(
    () => buildColorAssignmentsByGroup(assignments, colorVariables),
    [assignments, colorVariables],
  );
  const groupKeysInOrder = useMemo(() => sortedGroupKeys(byGroup), [byGroup]);

  function onColorAssignmentsSectionHeaderToggleClick() {
    setCollapsed((c) => !c);
  }

  return (
    <div className="tree-section">
      <div className="tree-header tree-header-with-checkbox">
        <TriStateCheckbox
          state={sectionState}
          onChange={onSetAllColorChecked}
          ariaLabel="Select all color variables"
          className="tree-section-checkbox"
        />
        <button
          type="button"
          className="tree-header-toggle"
          onClick={onColorAssignmentsSectionHeaderToggleClick}
          aria-expanded={!collapsed}
        >
          <span className="material-symbols-outlined tree-chevron">
            {collapsed ? 'chevron_right' : 'expand_more'}
          </span>
          <span className="tree-label">Color Variables</span>
          <span className="tree-count">({assignments.length})</span>
        </button>
      </div>

      {!collapsed && (
        <div className="tree-children">
          {groupKeysInOrder.map((groupKey) => {
            const groupAssignments = byGroup.get(groupKey) ?? [];
            const groupLabel = groupKey === UNGROUPED_KEY ? 'Ungrouped' : groupKey;
            const refsInGroup = groupAssignments.map((a) => a.colorRef);
            const groupState: TriState =
              refsInGroup.length === 0
                ? 'none'
                : refsInGroup.every((r) => checkedColorRefs.has(r))
                  ? 'all'
                  : refsInGroup.every((r) => !checkedColorRefs.has(r))
                    ? 'none'
                    : 'some';
            return (
              <ColorAssignmentsGroupSubsection
                key={groupKey}
                groupKey={groupKey}
                groupLabel={groupLabel}
                groupState={groupState}
                assignments={groupAssignments}
                orphanKeys={orphanKeys}
                checkedColorRefs={checkedColorRefs}
                onToggleColorChecked={onToggleColorChecked}
                onSetColorGroupChecked={onSetColorGroupChecked}
                onUpdateDark={onUpdateDark}
                onUpdateLight={onUpdateLight}
                onUpdateUseDark={onUpdateUseDark}
                onDarkEyedropperClick={onDarkEyedropperClick}
                onLightEyedropperClick={onLightEyedropperClick}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

function ColorAssignmentsGroupSubsection({
  groupKey,
  groupLabel,
  groupState,
  assignments,
  orphanKeys,
  checkedColorRefs,
  onToggleColorChecked,
  onSetColorGroupChecked,
  onUpdateDark,
  onUpdateLight,
  onUpdateUseDark,
  onDarkEyedropperClick,
  onLightEyedropperClick,
}: {
  groupKey: string;
  groupLabel: string;
  groupState: TriState;
  assignments: readonly ColorAssignment[];
  orphanKeys: Set<string>;
  checkedColorRefs: ReadonlySet<string>;
  onToggleColorChecked: (ref: string) => void;
  onSetColorGroupChecked: (groupKey: string, checked: boolean) => void;
  onUpdateDark: (colorRef: string, value: string | null) => void;
  onUpdateLight: (colorRef: string, value: string | null) => void;
  onUpdateUseDark: (colorRef: string, useDark: boolean) => void;
  onDarkEyedropperClick: (colorRef: string) => void;
  onLightEyedropperClick: (colorRef: string) => void;
}) {
  const [collapsed, setCollapsed] = useState(false);

  function onColorGroupTriStateChange(checked: boolean) {
    onSetColorGroupChecked(groupKey, checked);
  }

  function onColorGroupHeaderToggleClick() {
    setCollapsed((c) => !c);
  }

  return (
    <div className="tree-section">
      <div className="tree-header tree-header-with-checkbox">
        <TriStateCheckbox
          state={groupState}
          onChange={onColorGroupTriStateChange}
          ariaLabel={`Select all in group: ${groupLabel}`}
          className="tree-section-checkbox"
        />
        <button
          type="button"
          className="tree-header-toggle"
          onClick={onColorGroupHeaderToggleClick}
          aria-expanded={!collapsed}
        >
          <span className="material-symbols-outlined tree-chevron">
            {collapsed ? 'chevron_right' : 'expand_more'}
          </span>
          <span className="tree-label">{groupLabel}</span>
          <span className="tree-count">({assignments.length})</span>
        </button>
      </div>
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
              checked={checkedColorRefs.has(a.colorRef)}
              onToggleChecked={onToggleColorChecked}
              onUpdateDark={onUpdateDark}
              onUpdateLight={onUpdateLight}
              onUpdateUseDark={onUpdateUseDark}
              onDarkEyedropperClick={onDarkEyedropperClick}
              onLightEyedropperClick={onLightEyedropperClick}
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
  checked,
  onToggleChecked,
  onUpdateDark,
  onUpdateLight,
  onUpdateUseDark,
  onDarkEyedropperClick,
  onLightEyedropperClick,
}: {
  assignment: ColorAssignment;
  isOrphan: boolean;
  checked: boolean;
  onToggleChecked: (ref: string) => void;
  onUpdateDark: (colorRef: string, value: string | null) => void;
  onUpdateLight: (colorRef: string, value: string | null) => void;
  onUpdateUseDark: (colorRef: string, useDark: boolean) => void;
  onDarkEyedropperClick: (colorRef: string) => void;
  onLightEyedropperClick: (colorRef: string) => void;
}) {
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

function ContrastAssignmentsSection({
  assignments,
  contrastVariables,
  orphanKeys,
  checkedContrastRefs,
  onToggleContrastChecked,
  sectionState,
  onSetAllContrastChecked,
  onSetContrastGroupChecked,
  onUpdateDark,
  onUpdateLight,
  onUpdateUseDark,
}: {
  assignments: readonly ContrastAssignment[];
  contrastVariables: readonly ContrastVariable[];
  orphanKeys: Set<string>;
  checkedContrastRefs: ReadonlySet<string>;
  onToggleContrastChecked: (ref: string) => void;
  sectionState: TriState;
  onSetAllContrastChecked: (checked: boolean) => void;
  onSetContrastGroupChecked: (groupKey: string, checked: boolean) => void;
  onUpdateDark: (contrastRef: string, field: keyof ContrastAssignmentValue, value: number | ContrastComparisonMethod | null) => void;
  onUpdateLight: (contrastRef: string, field: keyof ContrastAssignmentValue, value: number | ContrastComparisonMethod | null) => void;
  onUpdateUseDark: (contrastRef: string, useDark: boolean) => void;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const varMap = useMemo(
    () => new Map(contrastVariables.map((v) => [v.key, v])),
    [contrastVariables],
  );
  const byGroup = useMemo(
    () => buildContrastAssignmentsByGroup(assignments, contrastVariables),
    [assignments, contrastVariables],
  );
  const groupKeysInOrder = useMemo(() => sortedGroupKeys(byGroup), [byGroup]);

  function onContrastAssignmentsSectionHeaderToggleClick() {
    setCollapsed((c) => !c);
  }

  return (
    <div className="tree-section">
      <div className="tree-header tree-header-with-checkbox">
        <TriStateCheckbox
          state={sectionState}
          onChange={onSetAllContrastChecked}
          ariaLabel="Select all contrast variables"
          className="tree-section-checkbox"
        />
        <button
          type="button"
          className="tree-header-toggle"
          onClick={onContrastAssignmentsSectionHeaderToggleClick}
          aria-expanded={!collapsed}
        >
          <span className="material-symbols-outlined tree-chevron">
            {collapsed ? 'chevron_right' : 'expand_more'}
          </span>
          <span className="tree-label">Contrast Variables</span>
          <span className="tree-count">({assignments.length})</span>
        </button>
      </div>

      {!collapsed && (
        <div className="tree-children">
          {groupKeysInOrder.map((groupKey) => {
            const groupAssignments = byGroup.get(groupKey) ?? [];
            const groupLabel = groupKey === UNGROUPED_KEY ? 'Ungrouped' : groupKey;
            const refsInGroup = groupAssignments.map((a) => a.contrastVariableRef);
            const groupState: TriState =
              refsInGroup.length === 0
                ? 'none'
                : refsInGroup.every((r) => checkedContrastRefs.has(r))
                  ? 'all'
                  : refsInGroup.every((r) => !checkedContrastRefs.has(r))
                    ? 'none'
                    : 'some';
            return (
              <ContrastAssignmentsGroupSubsection
                key={groupKey}
                groupKey={groupKey}
                groupLabel={groupLabel}
                groupState={groupState}
                assignments={groupAssignments}
                varMap={varMap}
                orphanKeys={orphanKeys}
                checkedContrastRefs={checkedContrastRefs}
                onToggleContrastChecked={onToggleContrastChecked}
                onSetContrastGroupChecked={onSetContrastGroupChecked}
                onUpdateDark={onUpdateDark}
                onUpdateLight={onUpdateLight}
                onUpdateUseDark={onUpdateUseDark}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

function ContrastAssignmentsGroupSubsection({
  groupKey,
  groupLabel,
  groupState,
  assignments,
  varMap,
  orphanKeys,
  checkedContrastRefs,
  onToggleContrastChecked,
  onSetContrastGroupChecked,
  onUpdateDark,
  onUpdateLight,
  onUpdateUseDark,
}: {
  groupKey: string;
  groupLabel: string;
  groupState: TriState;
  assignments: readonly ContrastAssignment[];
  varMap: Map<string, ContrastVariable>;
  orphanKeys: Set<string>;
  checkedContrastRefs: ReadonlySet<string>;
  onToggleContrastChecked: (ref: string) => void;
  onSetContrastGroupChecked: (groupKey: string, checked: boolean) => void;
  onUpdateDark: (contrastRef: string, field: keyof ContrastAssignmentValue, value: number | ContrastComparisonMethod | null) => void;
  onUpdateLight: (contrastRef: string, field: keyof ContrastAssignmentValue, value: number | ContrastComparisonMethod | null) => void;
  onUpdateUseDark: (contrastRef: string, useDark: boolean) => void;
}) {
  const [collapsed, setCollapsed] = useState(false);

  function onContrastGroupTriStateChange(checked: boolean) {
    onSetContrastGroupChecked(groupKey, checked);
  }

  function onContrastGroupHeaderToggleClick() {
    setCollapsed((c) => !c);
  }

  return (
    <div className="tree-section">
      <div className="tree-header tree-header-with-checkbox">
        <TriStateCheckbox
          state={groupState}
          onChange={onContrastGroupTriStateChange}
          ariaLabel={`Select all in group: ${groupLabel}`}
          className="tree-section-checkbox"
        />
        <button
          type="button"
          className="tree-header-toggle"
          onClick={onContrastGroupHeaderToggleClick}
          aria-expanded={!collapsed}
        >
          <span className="material-symbols-outlined tree-chevron">
            {collapsed ? 'chevron_right' : 'expand_more'}
          </span>
          <span className="tree-label">{groupLabel}</span>
          <span className="tree-count">({assignments.length})</span>
        </button>
      </div>
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
              checked={checkedContrastRefs.has(a.contrastVariableRef)}
              onToggleChecked={onToggleContrastChecked}
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
  checked,
  onToggleChecked,
  onUpdateDark,
  onUpdateLight,
  onUpdateUseDark,
}: {
  assignment: ContrastAssignment;
  variable: ContrastVariable | null;
  isOrphan: boolean;
  checked: boolean;
  onToggleChecked: (ref: string) => void;
  onUpdateDark: (contrastRef: string, field: keyof ContrastAssignmentValue, value: number | ContrastComparisonMethod | null) => void;
  onUpdateLight: (contrastRef: string, field: keyof ContrastAssignmentValue, value: number | ContrastComparisonMethod | null) => void;
  onUpdateUseDark: (contrastRef: string, useDark: boolean) => void;
}) {
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

function matchesSearch(key: string, searchQuery: string): boolean {
  const q = searchQuery.trim().toLowerCase();
  return !q || key.toLowerCase().includes(q);
}

export function ThemeVariablesCard() {
  const {
    theme,
    colorAssignments,
    contrastAssignments,
    colorVariables,
    contrastVariables,
    orphanColorKeys,
    orphanContrastKeys,
    checkedColorRefs,
    checkedContrastRefs,
    onToggleColorChecked,
    onToggleContrastChecked,
    onSetAllColorChecked,
    onSetAllContrastChecked,
    onSetAllVariablesChecked,
    onSetColorGroupChecked,
    onSetContrastGroupChecked,
    colorSectionState,
    contrastSectionState,
    cardState,
    onUpdateColorDark,
    onUpdateColorLight,
    onUpdateColorUseDark,
    onUpdateContrastDark,
    onUpdateContrastLight,
    onUpdateContrastUseDark,
    onColorDarkEyedropperClick,
    onColorLightEyedropperClick,
    searchValue: searchQuery,
    onSearchChange: setSearchQuery,
  } = useThemeVariablesCardViewModel();

  if (!theme?.templateRef) return null;

  const filteredColorAssignments = colorAssignments
    .filter((a: ColorAssignment) => matchesSearch(a.colorRef, searchQuery))
    .sort((a: ColorAssignment, b: ColorAssignment) => a.colorRef.localeCompare(b.colorRef));
  const filteredContrastAssignments = contrastAssignments
    .filter((a: ContrastAssignment) => matchesSearch(a.contrastVariableRef, searchQuery))
    .sort((a: ContrastAssignment, b: ContrastAssignment) => a.contrastVariableRef.localeCompare(b.contrastVariableRef));

  function onThemeVariablesSearchInputChange(e: ChangeEvent<HTMLInputElement>) {
    setSearchQuery(e.target.value);
  }

  return (
    <div className="tokens-card placeholder">
      <div className="theme-variables-card-header">
        <TriStateCheckbox
          state={cardState}
          onChange={onSetAllVariablesChecked}
          ariaLabel="Select all variables for palette adjustments"
          className="theme-variables-card-checkbox"
        />
        <h2>Variables</h2>
      </div>
      <input
        type="text"
        className="card-search-input"
        placeholder="Search…"
        value={searchQuery}
        onChange={onThemeVariablesSearchInputChange}
        aria-label="Search variables"
      />
      <ColorAssignmentsSection
        assignments={filteredColorAssignments}
        colorVariables={colorVariables}
        orphanKeys={orphanColorKeys}
        checkedColorRefs={checkedColorRefs}
        onToggleColorChecked={onToggleColorChecked}
        sectionState={colorSectionState}
        onSetAllColorChecked={onSetAllColorChecked}
        onSetColorGroupChecked={onSetColorGroupChecked}
        onUpdateDark={onUpdateColorDark}
        onUpdateLight={onUpdateColorLight}
        onUpdateUseDark={onUpdateColorUseDark}
        onDarkEyedropperClick={onColorDarkEyedropperClick}
        onLightEyedropperClick={onColorLightEyedropperClick}
      />
      <ContrastAssignmentsSection
        assignments={filteredContrastAssignments}
        contrastVariables={contrastVariables}
        orphanKeys={orphanContrastKeys}
        checkedContrastRefs={checkedContrastRefs}
        onToggleContrastChecked={onToggleContrastChecked}
        sectionState={contrastSectionState}
        onSetAllContrastChecked={onSetAllContrastChecked}
        onSetContrastGroupChecked={onSetContrastGroupChecked}
        onUpdateDark={onUpdateContrastDark}
        onUpdateLight={onUpdateContrastLight}
        onUpdateUseDark={onUpdateContrastUseDark}
      />
    </div>
  );
}
