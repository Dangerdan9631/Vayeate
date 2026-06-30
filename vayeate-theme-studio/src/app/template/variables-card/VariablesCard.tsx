import { useState, type ChangeEvent } from 'react';
import {
  useVariablesCardViewModel,
  type VariableGroupSection,
} from './use-variables-card-viewmodel';
import type { ColorVariableKey } from '../../../model/schema/primitives';
import type { TemplateVariableKind } from '../../../model/template-variable-kind';
import type { ColorVariable, ContrastVariable, StyleVariable } from '../../../model/schema/template-schemas';
import { VirtualizedRowList } from '../../common/virtualized-row-list/VirtualizedRowList';
import { ColorVariableRow } from './ColorVariableRow';
import { ContrastVariableRow } from './ContrastVariableRow';
import { StyleVariableRow } from './StyleVariableRow';

function ColorGroupSubsection({
  groupLabel,
  groupRef,
  colorVariables,
  sortedGroups,
  referencedKeys,
  canEdit,
  getAddVariableName,
  canAddVariable,
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
  getAddVariableName: (variableKind: TemplateVariableKind, groupRef: string | null) => string;
  canAddVariable: (variableKind: TemplateVariableKind, groupRef: string | null) => boolean;
  onAddVariableNameChange: (variableKind: TemplateVariableKind, groupRef: string | null, value: string) => void;
  onAdd: (groupRef: string | null) => void;
  onRemove: (key: string) => void;
  onUpdateGroupRef: (key: string, groupRef: string | null) => void;
}) {
  const [collapsed, setCollapsed] = useState(false);

  function onColorGroupTreeHeaderClick() {
    setCollapsed((c) => !c);
  }

  function onAddVariableNameInputChange(e: ChangeEvent<HTMLInputElement>) {
    onAddVariableNameChange('color', groupRef, e.target.value);
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
                value={getAddVariableName('color', groupRef)}
                onChange={onAddVariableNameInputChange}
              />
              <button
                type="button"
                className="btn-icon btn-add-icon"
                title="Add"
                disabled={!canAddVariable('color', groupRef)}
                onClick={onAddColorVariableButtonClick}
              >
                <span className="material-symbols-outlined">add</span>
              </button>
            </div>
          )}
          <VirtualizedRowList
            items={colorVariables}
            getItemKey={(v) => v.key}
            estimateSize={() => 36}
            renderItem={(v) => (
              <ColorVariableRow
                variable={v}
                sortedGroups={sortedGroups}
                isReferenced={referencedKeys.has(v.key)}
                canEdit={canEdit}
                onUpdateGroupRef={onUpdateGroupRef}
                onRemove={onRemove}
              />
            )}
          />
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
  getAddVariableName,
  canAddVariable,
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
  getAddVariableName: (variableKind: TemplateVariableKind, groupRef: string | null) => string;
  canAddVariable: (variableKind: TemplateVariableKind, groupRef: string | null) => boolean;
  onAddVariableNameChange: (variableKind: TemplateVariableKind, groupRef: string | null, value: string) => void;
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
              getAddVariableName={getAddVariableName}
              canAddVariable={canAddVariable}
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
  getAddVariableName,
  canAddVariable,
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
  getAddVariableName: (variableKind: TemplateVariableKind, groupRef: string | null) => string;
  canAddVariable: (variableKind: TemplateVariableKind, groupRef: string | null) => boolean;
  onAddVariableNameChange: (variableKind: TemplateVariableKind, groupRef: string | null, value: string) => void;
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
    onAddVariableNameChange('contrast', groupRef, e.target.value);
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
                value={getAddVariableName('contrast', groupRef)}
                onChange={onContrastAddVariableNameInputChange}
              />
              <button
                type="button"
                className="btn-icon btn-add-icon"
                title="Add"
                disabled={!canAddVariable('contrast', groupRef)}
                onClick={onAddContrastVariableButtonClick}
              >
                <span className="material-symbols-outlined">add</span>
              </button>
            </div>
          )}
          <VirtualizedRowList
            items={contrastVariables}
            getItemKey={(v) => v.key}
            estimateSize={() => 36}
            renderItem={(v) => (
              <ContrastVariableRow
                variable={v}
                colorVariables={colorVariables}
                sortedGroups={sortedGroups}
                isReferenced={referencedKeys.has(v.key)}
                canEdit={canEdit}
                onUpdateGroupRef={onUpdateGroupRef}
                onUpdateComparisonSource={onUpdateComparisonSource}
                onRemove={onRemove}
              />
            )}
          />
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
  getAddVariableName,
  canAddVariable,
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
  getAddVariableName: (variableKind: TemplateVariableKind, groupRef: string | null) => string;
  canAddVariable: (variableKind: TemplateVariableKind, groupRef: string | null) => boolean;
  onAddVariableNameChange: (variableKind: TemplateVariableKind, groupRef: string | null, value: string) => void;
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
              getAddVariableName={getAddVariableName}
              canAddVariable={canAddVariable}
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

function StyleGroupSubsection({
  groupLabel,
  groupRef,
  styleVariables,
  sortedGroups,
  referencedKeys,
  canEdit,
  getAddVariableName,
  canAddVariable,
  onAddVariableNameChange,
  onAdd,
  onRemove,
  onUpdateGroupRef,
}: {
  groupLabel: string;
  groupRef: string | null;
  styleVariables: readonly StyleVariable[];
  sortedGroups: readonly string[];
  referencedKeys: Set<string>;
  canEdit: boolean;
  getAddVariableName: (variableKind: TemplateVariableKind, groupRef: string | null) => string;
  canAddVariable: (variableKind: TemplateVariableKind, groupRef: string | null) => boolean;
  onAddVariableNameChange: (variableKind: TemplateVariableKind, groupRef: string | null, value: string) => void;
  onAdd: (groupRef: string | null) => void;
  onRemove: (key: string) => void;
  onUpdateGroupRef: (key: string, groupRef: string | null) => void;
}) {
  const [collapsed, setCollapsed] = useState(false);

  function onStyleGroupTreeHeaderClick() {
    setCollapsed((c) => !c);
  }

  function onStyleAddVariableNameInputChange(e: ChangeEvent<HTMLInputElement>) {
    onAddVariableNameChange('style', groupRef, e.target.value);
  }

  function onAddStyleVariableButtonClick() {
    onAdd(groupRef);
  }

  return (
    <div className="tree-section">
      <button
        type="button"
        className="tree-header"
        onClick={onStyleGroupTreeHeaderClick}
      >
        <span className="material-symbols-outlined tree-chevron">
          {collapsed ? 'chevron_right' : 'expand_more'}
        </span>
        <span className="tree-label">{groupLabel}</span>
        <span className="tree-count">({styleVariables.length})</span>
      </button>
      {!collapsed && (
        <div className="tree-children">
          {canEdit && (
            <div className="variable-row variable-add-row">
              <input
                className="token-input"
                type="text"
                placeholder="new variable…"
                value={getAddVariableName('style', groupRef)}
                onChange={onStyleAddVariableNameInputChange}
              />
              <button
                type="button"
                className="btn-icon btn-add-icon"
                title="Add"
                disabled={!canAddVariable('style', groupRef)}
                onClick={onAddStyleVariableButtonClick}
              >
                <span className="material-symbols-outlined">add</span>
              </button>
            </div>
          )}
          <VirtualizedRowList
            items={styleVariables}
            getItemKey={(v) => v.key}
            estimateSize={() => 36}
            renderItem={(v) => (
              <StyleVariableRow
                variable={v}
                sortedGroups={sortedGroups}
                isReferenced={referencedKeys.has(v.key)}
                canEdit={canEdit}
                onUpdateGroupRef={onUpdateGroupRef}
                onRemove={onRemove}
              />
            )}
          />
        </div>
      )}
    </div>
  );
}

function StyleVariablesSection({
  styleVariableGroupSections,
  totalStyleVariableCount,
  sortedGroups,
  referencedKeys,
  canEdit,
  getAddVariableName,
  canAddVariable,
  onAddVariableNameChange,
  onAdd,
  onRemove,
  onUpdateGroupRef,
}: {
  styleVariableGroupSections: readonly VariableGroupSection<StyleVariable>[];
  totalStyleVariableCount: number;
  sortedGroups: readonly string[];
  referencedKeys: Set<string>;
  canEdit: boolean;
  getAddVariableName: (variableKind: TemplateVariableKind, groupRef: string | null) => string;
  canAddVariable: (variableKind: TemplateVariableKind, groupRef: string | null) => boolean;
  onAddVariableNameChange: (variableKind: TemplateVariableKind, groupRef: string | null, value: string) => void;
  onAdd: (groupRef: string | null) => void;
  onRemove: (key: string) => void;
  onUpdateGroupRef: (key: string, groupRef: string | null) => void;
}) {
  const [collapsed, setCollapsed] = useState(false);

  function onStyleVariablesSectionHeaderClick() {
    setCollapsed((c) => !c);
  }

  return (
    <div className="tree-section">
      <button
        type="button"
        className="tree-header"
        onClick={onStyleVariablesSectionHeaderClick}
      >
        <span className="material-symbols-outlined tree-chevron">
          {collapsed ? 'chevron_right' : 'expand_more'}
        </span>
        <span className="tree-label">Style Variables</span>
        <span className="tree-count">({totalStyleVariableCount})</span>
      </button>

      {!collapsed && (
        <div className="tree-children">
          {(styleVariableGroupSections ?? []).map(({ groupKey, groupLabel, groupRef, variables }) => (
            <StyleGroupSubsection
              key={groupKey}
              groupLabel={groupLabel}
              groupRef={groupRef}
              styleVariables={variables}
              sortedGroups={sortedGroups}
              referencedKeys={referencedKeys}
              canEdit={canEdit}
              getAddVariableName={getAddVariableName}
              canAddVariable={canAddVariable}
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
    filteredStyleVariables,
    sortedColorVariables,
    colorVariableGroupSections,
    contrastVariableGroupSections,
    styleVariableGroupSections,
    referencedColorVarKeys,
    referencedContrastVarKeys,
    referencedStyleVarKeys,
    canEdit,
    variablesSearchText,
    getAddVariableName,
    canAddVariable,
    onAddVariableNameChange,
    onAddColorVariableClick,
    onRemoveColorVariableClick,
    onAddContrastVariableClick,
    onRemoveContrastVariableClick,
    onAddStyleVariableClick,
    onRemoveStyleVariableClick,
    onUpdateColorVariableGroupRef,
    onUpdateContrastVariableGroupRef,
    onUpdateStyleVariableGroupRef,
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

  function onStyleVariablesSectionAdd(groupRef: string | null) {
    onAddStyleVariableClick(groupRef);
  }

  function onStyleVariablesSectionRemove(key: string) {
    onRemoveStyleVariableClick(key);
  }

  function onStyleVariablesSectionUpdateGroupRef(key: string, groupRef: string | null) {
    onUpdateStyleVariableGroupRef(key, groupRef);
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
        getAddVariableName={getAddVariableName}
        canAddVariable={canAddVariable}
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
        getAddVariableName={getAddVariableName}
        canAddVariable={canAddVariable}
        onAddVariableNameChange={onAddVariableNameChange}
        onAdd={onContrastVariablesSectionAdd}
        onRemove={onContrastVariablesSectionRemove}
        onUpdateGroupRef={onContrastVariablesSectionUpdateGroupRef}
        onUpdateComparisonSource={onContrastVariablesSectionUpdateComparisonSource}
      />
      <StyleVariablesSection
        styleVariableGroupSections={styleVariableGroupSections}
        totalStyleVariableCount={(filteredStyleVariables ?? []).length}
        sortedGroups={sortedGroups}
        referencedKeys={referencedStyleVarKeys ?? new Set<string>()}
        canEdit={canEdit}
        getAddVariableName={getAddVariableName}
        canAddVariable={canAddVariable}
        onAddVariableNameChange={onAddVariableNameChange}
        onAdd={onStyleVariablesSectionAdd}
        onRemove={onStyleVariablesSectionRemove}
        onUpdateGroupRef={onStyleVariablesSectionUpdateGroupRef}
      />
    </div>
  );
}
