import { useState, type ChangeEvent } from 'react';
import {
  useVariablesCardViewModel,
  type VariableGroupSection,
} from './use-variables-card-viewmodel';
import type { ColorVariableKey } from '../../../model/schema/primitives';
import type { ColorVariable, ContrastVariable } from '../../../model/schema/template-schemas';

function ColorGroupSubsection({
  groupLabel,
  groupRef,
  colorVariables,
  sortedGroups,
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
  sortedGroups: readonly string[];
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
                {sortedGroups.map((g) => (
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
  colorVariableGroupSections,
  totalColorVariableCount,
  sortedGroups,
  referencedKeys,
  canEdit,
  canAddColorVariable,
  addVariableName,
  onAddVariableNameChange,
  onAdd,
  onRemove,
  onUpdateGroupRef,
}: {
  colorVariableGroupSections: readonly VariableGroupSection<ColorVariable>[];
  totalColorVariableCount: number;
  sortedGroups: readonly string[];
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
        <span className="tree-count">({totalColorVariableCount})</span>
      </button>

      {!collapsed && (
        <div className="tree-children">
          {colorVariableGroupSections.map(({ groupKey, groupLabel, groupRef, variables }) => (
            <ColorGroupSubsection
              key={groupKey}
              groupLabel={groupLabel}
              groupRef={groupRef}
              colorVariables={variables}
              sortedGroups={sortedGroups}
              referencedKeys={referencedKeys}
              canEdit={canEdit}
              canAddColorVariable={canAddColorVariable}
              addVariableName={addVariableName}
              onAddVariableNameChange={onAddVariableNameChange}
              onAdd={onAdd}
              onRemove={onRemove}
              onUpdateGroupRef={onUpdateGroupRef}
            />
          ))}
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
  sortedGroups,
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
  sortedGroups: readonly string[];
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
                {sortedGroups.map((g) => (
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
  contrastVariableGroupSections,
  totalContrastVariableCount,
  colorVariables,
  sortedGroups,
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
  contrastVariableGroupSections: readonly VariableGroupSection<ContrastVariable>[];
  totalContrastVariableCount: number;
  colorVariables: readonly ColorVariable[];
  sortedGroups: readonly string[];
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
        <span className="tree-count">({totalContrastVariableCount})</span>
      </button>

      {!collapsed && (
        <div className="tree-children">
          {contrastVariableGroupSections.map(({ groupKey, groupLabel, groupRef, variables }) => (
            <ContrastGroupSubsection
              key={groupKey}
              groupLabel={groupLabel}
              groupRef={groupRef}
              contrastVariables={variables}
              colorVariables={colorVariables}
              sortedGroups={sortedGroups}
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
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Renders color and contrast variable lists with search and assignment controls.
 * @returns Variables card UI wired to its viewmodel.
 */
export function VariablesCard() {
  const {
    template,
    sortedGroups,
    filteredColorVariables,
    filteredContrastVariables,
    sortedColorVariables,
    colorVariableGroupSections,
    contrastVariableGroupSections,
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
        colorVariableGroupSections={colorVariableGroupSections}
        totalColorVariableCount={filteredColorVariables.length}
        sortedGroups={sortedGroups}
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
        contrastVariableGroupSections={contrastVariableGroupSections}
        totalContrastVariableCount={filteredContrastVariables.length}
        colorVariables={sortedColorVariables}
        sortedGroups={sortedGroups}
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
