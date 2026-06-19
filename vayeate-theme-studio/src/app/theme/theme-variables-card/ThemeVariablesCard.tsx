import { useMemo, useState, type ChangeEvent } from 'react';
import type { ContrastComparisonMethod } from '../../../model/schema/primitives';
import type { ColorVariable, ContrastVariable } from '../../../model/schema/template-schemas';
import type { ColorAssignment, ContrastAssignment, ContrastAssignmentValue } from '../../../model/schema/theme-schemas';
import { useThemeVariablesCardViewModel } from './use-theme-variables-card-viewmodel';
import { TriStateCheckbox, type TriState } from '../../common/tristate-checkbox/TriStateCheckbox';
import { VirtualizedRowList } from '../../common/virtualized-row-list/VirtualizedRowList';
import { ColorAssignmentRow } from './ColorAssignmentRow';
import { ContrastAssignmentRow } from './ContrastAssignmentRow';

const UNGROUPED_KEY = '__ungrouped__';

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
          <VirtualizedRowList
            items={assignments}
            getItemKey={(a) => a.colorRef}
            estimateSize={() => 40}
            emptyHint="No color variables"
            renderItem={(a) => (
              <ColorAssignmentRow
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
            )}
          />
        </div>
      )}
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
          <VirtualizedRowList
            items={assignments}
            getItemKey={(a) => a.contrastVariableRef}
            estimateSize={() => 88}
            emptyHint="No contrast variables"
            renderItem={(a) => (
              <ContrastAssignmentRow
                assignment={a}
                variable={varMap.get(a.contrastVariableRef) ?? null}
                isOrphan={orphanKeys.has(a.contrastVariableRef)}
                checked={checkedContrastRefs.has(a.contrastVariableRef)}
                onToggleChecked={onToggleContrastChecked}
                onUpdateDark={onUpdateDark}
                onUpdateLight={onUpdateLight}
                onUpdateUseDark={onUpdateUseDark}
              />
            )}
          />
        </div>
      )}
    </div>
  );
}

/**
 * Renders the Theme Variables Card UI for the theme editor.
 */
export function ThemeVariablesCard() {
  const {
    themeTemplateRef,
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

  if (!themeTemplateRef) return null;

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
        assignments={colorAssignments}
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
        assignments={contrastAssignments}
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
