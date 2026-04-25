import { useState, type ChangeEvent } from 'react';
import { useVariablesCardViewModel } from './use-variables-card-viewmodel';
import type { ColorVariableKey } from '../../../model/schema/primitives';
import type { ColorVariable, ContrastVariable } from '../../../model/schema/template-schemas';
const UNGROUPED_KEY = '__ungrouped__';

function buildByGroup<T extends { groupRef?: string | null }>(
  items: readonly T[],
): Map<string, T[]> {
  const byGroup = new Map<string, T[]>();
  for (const v of items) {
    const groupKey = v.groupRef ?? UNGROUPED_KEY;
    let list = byGroup.get(groupKey);
    if (!list) {
      list = [];
      byGroup.set(groupKey, list);
    }
    list.push(v);
  }
  return byGroup;
}

function sortedGroupKeys(byGroup: Map<string, unknown[]>): string[] {
  const named = [...byGroup.keys()].filter((k) => k !== UNGROUPED_KEY).sort();
  const hasUngrouped = byGroup.has(UNGROUPED_KEY);
  return hasUngrouped ? [...named, UNGROUPED_KEY] : named;
}

function ColorGroupSubsection({
  groupLabel,
  groupRef,
  colorVariables,
  groups,
  referencedKeys,
  canEdit,
  canAddColorVariable,
  addVariableName,
  onAddVariableNameChange,
  onAdd,
  onRemove,
  onUpdateGroupRef,
}: {
  groupLabel: string;
  groupRef: string | null;
  colorVariables: readonly ColorVariable[];
  groups: readonly string[];
  referencedKeys: Set<string>;
  canEdit: boolean;
  canAddColorVariable: boolean;
  addVariableName: string;
  onAddVariableNameChange: (value: string) => void;
  onAdd: (groupRef: string | null) => void;
  onRemove: (key: string) => void;
  onUpdateGroupRef: (key: string, groupRef: string | null) => void;
}) {
  const [collapsed, setCollapsed] = useState(false);

  function onColorGroupTreeHeaderClick() {
    setCollapsed((c) => !c);
  }

  function onAddVariableNameInputChange(e: ChangeEvent<HTMLInputElement>) {
    onAddVariableNameChange(e.target.value);
  }

  function onAddColorVariableButtonClick() {
    onAdd(groupRef);
  }

  return (
    <div className="tree-section">
      <button
        type="button"
        className="tree-header"
        onClick={onColorGroupTreeHeaderClick}
      >
        <span className="material-symbols-outlined tree-chevron">
          {collapsed ? 'chevron_right' : 'expand_more'}
        </span>
        <span className="tree-label">{groupLabel}</span>
        <span className="tree-count">({colorVariables.length})</span>
      </button>
      {!collapsed && (
        <div className="tree-children">
          {canEdit && (
            <div className="variable-row variable-add-row">
              <input
                className="token-input"
                type="text"
                placeholder="new variable…"
                value={addVariableName}
                onChange={onAddVariableNameInputChange}
              />
              <button
                type="button"
                className="btn-icon btn-add-icon"
                title="Add"
                disabled={!canAddColorVariable}
                onClick={onAddColorVariableButtonClick}
              >
                <span className="material-symbols-outlined">add</span>
              </button>
            </div>
          )}
          {colorVariables.map((v) => {
            function onColorVariableGroupRefChange(e: ChangeEvent<HTMLSelectElement>) {
              onUpdateGroupRef(v.key, e.target.value || null);
            }
            function onRemoveColorVariableClick() {
              onRemove(v.key);
            }
            return (
            <div key={v.key} className="variable-row">
              <select
                className="field-select mapping-var-select"
                value={v.groupRef ?? ''}
                disabled={!canEdit}
                onChange={onColorVariableGroupRefChange}
                title="Group"
              >
                <option value="">Ungrouped</option>
                {[...groups].sort((a, b) => a.localeCompare(b)).map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
              <span className="variable-name">{v.key}</span>
              {canEdit && (
                <button
                  type="button"
                  className="btn-icon btn-danger-icon"
                  title={referencedKeys.has(v.key) ? 'Cannot remove: variable is referenced' : 'Remove'}
                  disabled={referencedKeys.has(v.key)}
                  onClick={onRemoveColorVariableClick}
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              )}
            </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ColorVariablesSection({
  colorVariables,
  groups,
  referencedKeys,
  canEdit,
  canAddColorVariable,
  addVariableName,
  onAddVariableNameChange,
  onAdd,
  onRemove,
  onUpdateGroupRef,
}: {
  colorVariables: readonly ColorVariable[];
  groups: readonly string[];
  referencedKeys: Set<string>;
  canEdit: boolean;
  canAddColorVariable: boolean;
  addVariableName: string;
  onAddVariableNameChange: (value: string) => void;
  onAdd: (groupRef: string | null) => void;
  onRemove: (key: string) => void;
  onUpdateGroupRef: (key: string, groupRef: string | null) => void;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const byGroup = buildByGroup(colorVariables);
  const groupKeysInOrder = sortedGroupKeys(byGroup);
  const keysToRender = groupKeysInOrder.length > 0 ? groupKeysInOrder : [UNGROUPED_KEY];

  function onColorVariablesSectionHeaderClick() {
    setCollapsed((c) => !c);
  }

  return (
    <div className="tree-section">
      <button
        type="button"
        className="tree-header"
        onClick={onColorVariablesSectionHeaderClick}
      >
        <span className="material-symbols-outlined tree-chevron">
          {collapsed ? 'chevron_right' : 'expand_more'}
        </span>
        <span className="tree-label">Color Variables</span>
        <span className="tree-count">({colorVariables.length})</span>
      </button>

      {!collapsed && (
        <div className="tree-children">
          {keysToRender.map((groupKey) => {
            const vars = byGroup.get(groupKey) ?? [];
            const groupLabel = groupKey === UNGROUPED_KEY ? 'Ungrouped' : groupKey;
            const groupRef = groupKey === UNGROUPED_KEY ? null : groupKey;
            return (
              <ColorGroupSubsection
                key={groupKey}
                groupLabel={groupLabel}
                groupRef={groupRef}
                colorVariables={vars}
                groups={groups}
                referencedKeys={referencedKeys}
                canEdit={canEdit}
                canAddColorVariable={canAddColorVariable}
                addVariableName={addVariableName}
                onAddVariableNameChange={onAddVariableNameChange}
                onAdd={onAdd}
                onRemove={onRemove}
                onUpdateGroupRef={onUpdateGroupRef}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

function ContrastGroupSubsection({
  groupLabel,
  groupRef,
  contrastVariables,
  colorVariables,
  groups,
  referencedKeys,
  canEdit,
  canAddContrastVariable,
  addVariableName,
  onAddVariableNameChange,
  onAdd,
  onRemove,
  onUpdateGroupRef,
  onUpdateComparisonSource,
}: {
  groupLabel: string;
  groupRef: string | null;
  contrastVariables: readonly ContrastVariable[];
  colorVariables: readonly ColorVariable[];
  groups: readonly string[];
  referencedKeys: Set<string>;
  canEdit: boolean;
  canAddContrastVariable: boolean;
  addVariableName: string;
  onAddVariableNameChange: (value: string) => void;
  onAdd: (groupRef: string | null) => void;
  onRemove: (key: string) => void;
  onUpdateGroupRef: (key: string, groupRef: string | null) => void;
  onUpdateComparisonSource: (key: string, ref: ColorVariableKey | null) => void;
}) {
  const [collapsed, setCollapsed] = useState(false);

  function onContrastGroupTreeHeaderClick() {
    setCollapsed((c) => !c);
  }

  function onContrastAddVariableNameInputChange(e: ChangeEvent<HTMLInputElement>) {
    onAddVariableNameChange(e.target.value);
  }

  function onAddContrastVariableButtonClick() {
    onAdd(groupRef);
  }

  return (
    <div className="tree-section">
      <button
        type="button"
        className="tree-header"
        onClick={onContrastGroupTreeHeaderClick}
      >
        <span className="material-symbols-outlined tree-chevron">
          {collapsed ? 'chevron_right' : 'expand_more'}
        </span>
        <span className="tree-label">{groupLabel}</span>
        <span className="tree-count">({contrastVariables.length})</span>
      </button>
      {!collapsed && (
        <div className="tree-children">
          {canEdit && (
            <div className="variable-row variable-add-row">
              <input
                className="token-input"
                type="text"
                placeholder="new variable…"
                value={addVariableName}
                onChange={onContrastAddVariableNameInputChange}
              />
              <button
                type="button"
                className="btn-icon btn-add-icon"
                title="Add"
                disabled={!canAddContrastVariable}
                onClick={onAddContrastVariableButtonClick}
              >
                <span className="material-symbols-outlined">add</span>
              </button>
            </div>
          )}
          {contrastVariables.map((v) => {
            function onContrastVariableGroupRefChange(e: ChangeEvent<HTMLSelectElement>) {
              onUpdateGroupRef(v.key, e.target.value || null);
            }
            function onComparisonSourceChange(e: ChangeEvent<HTMLSelectElement>) {
              onUpdateComparisonSource(v.key, e.target.value || null);
            }
            function onRemoveContrastVariableClick() {
              onRemove(v.key);
            }
            return (
            <div key={v.key} className="variable-row">
              <select
                className="field-select mapping-var-select"
                value={v.groupRef ?? ''}
                disabled={!canEdit}
                onChange={onContrastVariableGroupRefChange}
                title="Group"
              >
                <option value="">Ungrouped</option>
                {[...groups].sort((a, b) => a.localeCompare(b)).map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
              <span className="variable-name">{v.key}</span>
              <select
                className="field-select variable-comparison-select"
                value={v.comparisonSourceRef ?? ''}
                disabled={!canEdit}
                onChange={onComparisonSourceChange}
              >
                <option value="">— source —</option>
                {colorVariables.map((cv) => (
                  <option key={cv.key} value={cv.key}>
                    {cv.key}
                  </option>
                ))}
              </select>
              {canEdit && (
                <button
                  type="button"
                  className="btn-icon btn-danger-icon"
                  title={referencedKeys.has(v.key) ? 'Cannot remove: variable is referenced' : 'Remove'}
                  disabled={referencedKeys.has(v.key)}
                  onClick={onRemoveContrastVariableClick}
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              )}
            </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ContrastVariablesSection({
  contrastVariables,
  colorVariables,
  groups,
  referencedKeys,
  canEdit,
  canAddContrastVariable,
  addVariableName,
  onAddVariableNameChange,
  onAdd,
  onRemove,
  onUpdateGroupRef,
  onUpdateComparisonSource,
}: {
  contrastVariables: readonly ContrastVariable[];
  colorVariables: readonly ColorVariable[];
  groups: readonly string[];
  referencedKeys: Set<string>;
  canEdit: boolean;
  canAddContrastVariable: boolean;
  addVariableName: string;
  onAddVariableNameChange: (value: string) => void;
  onAdd: (groupRef: string | null) => void;
  onRemove: (key: string) => void;
  onUpdateGroupRef: (key: string, groupRef: string | null) => void;
  onUpdateComparisonSource: (key: string, ref: ColorVariableKey | null) => void;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const byGroup = buildByGroup(contrastVariables);
  const groupKeysInOrder = sortedGroupKeys(byGroup);
  const keysToRender = groupKeysInOrder.length > 0 ? groupKeysInOrder : [UNGROUPED_KEY];

  function onContrastVariablesSectionHeaderClick() {
    setCollapsed((c) => !c);
  }

  return (
    <div className="tree-section">
      <button
        type="button"
        className="tree-header"
        onClick={onContrastVariablesSectionHeaderClick}
      >
        <span className="material-symbols-outlined tree-chevron">
          {collapsed ? 'chevron_right' : 'expand_more'}
        </span>
        <span className="tree-label">Contrast Variables</span>
        <span className="tree-count">({contrastVariables.length})</span>
      </button>

      {!collapsed && (
        <div className="tree-children">
          {keysToRender.map((groupKey) => {
            const vars = byGroup.get(groupKey) ?? [];
            const groupLabel = groupKey === UNGROUPED_KEY ? 'Ungrouped' : groupKey;
            const groupRef = groupKey === UNGROUPED_KEY ? null : groupKey;
            return (
              <ContrastGroupSubsection
                key={groupKey}
                groupLabel={groupLabel}
                groupRef={groupRef}
                contrastVariables={vars}
                colorVariables={colorVariables}
                groups={groups}
                referencedKeys={referencedKeys}
                canEdit={canEdit}
                canAddContrastVariable={canAddContrastVariable}
                addVariableName={addVariableName}
                onAddVariableNameChange={onAddVariableNameChange}
                onAdd={onAdd}
                onRemove={onRemove}
                onUpdateGroupRef={onUpdateGroupRef}
                onUpdateComparisonSource={onUpdateComparisonSource}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

function matchesSearch(key: string, searchQuery: string): boolean {
  const q = searchQuery.trim().toLowerCase();
  return !q || key.toLowerCase().includes(q);
}

export function VariablesCard() {
  const {
    template,
    colorVariables,
    contrastVariables,
    groups,
    referencedColorVarKeys,
    referencedContrastVarKeys,
    canEdit,
    canAddColorVariable,
    canAddContrastVariable,
    variablesSearchText,
    addVariableName,
    onAddVariableNameChange,
    onAddColorVariableClick,
    onRemoveColorVariableClick,
    onAddContrastVariableClick,
    onRemoveContrastVariableClick,
    onUpdateColorVariableGroupRef,
    onUpdateContrastVariableGroupRef,
    onUpdateContrastComparisonSource,
    onVariablesSearchChange,
  } = useVariablesCardViewModel();

  if (!template) return null;

  const filteredColorVariables = colorVariables
    .filter((v: ColorVariable) => matchesSearch(v.key, variablesSearchText))
    .sort((a: ColorVariable, b: ColorVariable) => a.key.localeCompare(b.key));
  const filteredContrastVariables = contrastVariables
    .filter((v: ContrastVariable) => matchesSearch(v.key, variablesSearchText))
    .sort((a: ContrastVariable, b: ContrastVariable) => a.key.localeCompare(b.key));
  const sortedColorVariables = [...colorVariables].sort(
    (a: ColorVariable, b: ColorVariable) => a.key.localeCompare(b.key),
  );

  function onVariablesSearchInputChange(e: ChangeEvent<HTMLInputElement>) {
    onVariablesSearchChange(e.target.value);
  }

  function onColorVariablesSectionAdd(groupRef: string | null) {
    onAddColorVariableClick(groupRef);
  }

  function onColorVariablesSectionRemove(key: string) {
    onRemoveColorVariableClick(key);
  }

  function onColorVariablesSectionUpdateGroupRef(key: string, groupRef: string | null) {
    onUpdateColorVariableGroupRef(key, groupRef);
  }

  function onContrastVariablesSectionAdd(groupRef: string | null) {
    onAddContrastVariableClick(groupRef);
  }

  function onContrastVariablesSectionRemove(key: string) {
    onRemoveContrastVariableClick(key);
  }

  function onContrastVariablesSectionUpdateGroupRef(key: string, groupRef: string | null) {
    onUpdateContrastVariableGroupRef(key, groupRef);
  }

  function onContrastVariablesSectionUpdateComparisonSource(key: string, ref: ColorVariableKey | null) {
    onUpdateContrastComparisonSource(key, ref);
  }

  return (
    <div className="tokens-card placeholder">
      <h2>Variables</h2>
      <input
        type="text"
        className="card-search-input"
        placeholder="Search…"
        value={variablesSearchText}
        onChange={onVariablesSearchInputChange}
        aria-label="Search variables"
      />
      <ColorVariablesSection
        colorVariables={filteredColorVariables}
        groups={groups}
        referencedKeys={referencedColorVarKeys}
        canEdit={canEdit}
        canAddColorVariable={canAddColorVariable}
        addVariableName={addVariableName}
        onAddVariableNameChange={onAddVariableNameChange}
        onAdd={onColorVariablesSectionAdd}
        onRemove={onColorVariablesSectionRemove}
        onUpdateGroupRef={onColorVariablesSectionUpdateGroupRef}
      />
      <ContrastVariablesSection
        contrastVariables={filteredContrastVariables}
        colorVariables={sortedColorVariables}
        groups={groups}
        referencedKeys={referencedContrastVarKeys}
        canEdit={canEdit}
        canAddContrastVariable={canAddContrastVariable}
        addVariableName={addVariableName}
        onAddVariableNameChange={onAddVariableNameChange}
        onAdd={onContrastVariablesSectionAdd}
        onRemove={onContrastVariablesSectionRemove}
        onUpdateGroupRef={onContrastVariablesSectionUpdateGroupRef}
        onUpdateComparisonSource={onContrastVariablesSectionUpdateComparisonSource}
      />
    </div>
  );
}
