import { useState } from 'react';
import { useAppDispatch, useTemplatesState } from '../context/app-context-hooks';
import type { ColorVariable, ColorVariableKey, ContrastVariable } from '../../../model/schemas';
import { colorVariableKeySchema, contrastVariableKeySchema } from '../../../model/schemas';
import { TemplateActionType } from '../../actions/action-types';

const UNGROUPED_KEY = '__ungrouped__';

interface VariablesCardProps {
  colorVariables: readonly ColorVariable[];
  contrastVariables: readonly ContrastVariable[];
  groups: readonly string[];
  referencedColorVarKeys: Set<string>;
  referencedContrastVarKeys: Set<string>;
  canEdit: boolean;
  onAddColorVariable: (key: string, groupRef?: string | null) => void;
  onRemoveColorVariable: (key: string) => void;
  onAddContrastVariable: (key: string, groupRef?: string | null) => void;
  onRemoveContrastVariable: (key: string) => void;
  onUpdateColorVariableGroupRef: (key: string, groupRef: string | null) => void;
  onUpdateContrastVariableGroupRef: (key: string, groupRef: string | null) => void;
  onUpdateContrastComparisonSource: (key: string, ref: ColorVariableKey | null) => void;
}

function isValidVariableKey(value: string, type: 'color' | 'contrast'): boolean {
  const schema = type === 'color' ? colorVariableKeySchema : contrastVariableKeySchema;
  return schema.safeParse(value).success;
}

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
  onAdd: (key: string, groupRef: string | null) => void;
  onRemove: (key: string) => void;
  onUpdateGroupRef: (key: string, groupRef: string | null) => void;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [newKey, setNewKey] = useState('');

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
                value={newKey}
                onChange={(e) => {
                  setNewKey(e.target.value);
                }}
              />
              <button
                type="button"
                className="btn-icon btn-add-icon"
                title="Add"
                disabled={!isValidVariableKey(newKey.trim(), 'color')}
                onClick={() => {
                  const key = newKey.trim();
                  if (isValidVariableKey(key, 'color')) {
                    onAdd(key, groupRef);
                    setNewKey('');
                  }
                }}
              >
                <span className="material-symbols-outlined">add</span>
              </button>
            </div>
          )}
          {colorVariables.map((v) => (
            <div key={v.key} className="variable-row">
              <select
                className="field-select mapping-var-select"
                value={v.groupRef ?? ''}
                disabled={!canEdit}
                onChange={(e) =>
                  onUpdateGroupRef(v.key, e.target.value || null)
                }
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
                  onClick={() => onRemove(v.key)}
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              )}
            </div>
          ))}
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
  onAdd,
  onRemove,
  onUpdateGroupRef,
}: {
  colorVariables: readonly ColorVariable[];
  groups: readonly string[];
  referencedKeys: Set<string>;
  canEdit: boolean;
  onAdd: (key: string, groupRef: string | null) => void;
  onRemove: (key: string) => void;
  onUpdateGroupRef: (key: string, groupRef: string | null) => void;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const byGroup = buildByGroup(colorVariables);
  const groupKeysInOrder = sortedGroupKeys(byGroup);
  const keysToRender = groupKeysInOrder.length > 0 ? groupKeysInOrder : [UNGROUPED_KEY];

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
  onAdd: (key: string, groupRef: string | null) => void;
  onRemove: (key: string) => void;
  onUpdateGroupRef: (key: string, groupRef: string | null) => void;
  onUpdateComparisonSource: (key: string, ref: ColorVariableKey | null) => void;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [newKey, setNewKey] = useState('');

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
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
              />
              <button
                type="button"
                className="btn-icon btn-add-icon"
                title="Add"
                disabled={!isValidVariableKey(newKey.trim(), 'contrast')}
                onClick={() => {
                  const key = newKey.trim();
                  if (isValidVariableKey(key, 'contrast')) {
                    onAdd(key, groupRef);
                    setNewKey('');
                  }
                }}
              >
                <span className="material-symbols-outlined">add</span>
              </button>
            </div>
          )}
          {contrastVariables.map((v) => (
            <div key={v.key} className="variable-row">
              <select
                className="field-select mapping-var-select"
                value={v.groupRef ?? ''}
                disabled={!canEdit}
                onChange={(e) =>
                  onUpdateGroupRef(v.key, e.target.value || null)
                }
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
                onChange={(e) =>
                  onUpdateComparisonSource(v.key, e.target.value || null)
                }
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
                  onClick={() => onRemove(v.key)}
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              )}
            </div>
          ))}
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
  onAdd: (key: string, groupRef: string | null) => void;
  onRemove: (key: string) => void;
  onUpdateGroupRef: (key: string, groupRef: string | null) => void;
  onUpdateComparisonSource: (key: string, ref: ColorVariableKey | null) => void;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const byGroup = buildByGroup(contrastVariables);
  const groupKeysInOrder = sortedGroupKeys(byGroup);
  const keysToRender = groupKeysInOrder.length > 0 ? groupKeysInOrder : [UNGROUPED_KEY];

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

export function VariablesCard({
  colorVariables,
  contrastVariables,
  groups,
  referencedColorVarKeys,
  referencedContrastVarKeys,
  canEdit,
  onAddColorVariable,
  onRemoveColorVariable,
  onAddContrastVariable,
  onRemoveContrastVariable,
  onUpdateColorVariableGroupRef,
  onUpdateContrastVariableGroupRef,
  onUpdateContrastComparisonSource,
}: VariablesCardProps) {
  const dispatch = useAppDispatch();
  const { variablesSearchText } = useTemplatesState();

  const filteredColorVariables = colorVariables
    .filter((v) => matchesSearch(v.key, variablesSearchText))
    .sort((a, b) => a.key.localeCompare(b.key));
  const filteredContrastVariables = contrastVariables
    .filter((v) => matchesSearch(v.key, variablesSearchText))
    .sort((a, b) => a.key.localeCompare(b.key));
  const sortedColorVariables = [...colorVariables].sort((a, b) => a.key.localeCompare(b.key));

  return (
    <div className="tokens-card placeholder">
      <h2>Variables</h2>
      <input
        type="text"
        className="card-search-input"
        placeholder="Search…"
        value={variablesSearchText}
        onChange={(e) => {
          dispatch({ type: TemplateActionType.TemplateVariablesSearchTextOnChange, value: e.target.value });
        }}
        aria-label="Search variables"
      />
      <ColorVariablesSection
        colorVariables={filteredColorVariables}
        groups={groups}
        referencedKeys={referencedColorVarKeys}
        canEdit={canEdit}
        onAdd={(key, groupRef) => onAddColorVariable(key, groupRef)}
        onRemove={(key) => onRemoveColorVariable(key)}
        onUpdateGroupRef={(key, groupRef) => onUpdateColorVariableGroupRef(key, groupRef)}
      />
      <ContrastVariablesSection
        contrastVariables={filteredContrastVariables}
        colorVariables={sortedColorVariables}
        groups={groups}
        referencedKeys={referencedContrastVarKeys}
        canEdit={canEdit}
        onAdd={(key, groupRef) => onAddContrastVariable(key, groupRef)}
        onRemove={(key) => onRemoveContrastVariable(key)}
        onUpdateGroupRef={(key, groupRef) => onUpdateContrastVariableGroupRef(key, groupRef)}
        onUpdateComparisonSource={(key, ref) => onUpdateContrastComparisonSource(key, ref)}
      />
    </div>
  );
}
