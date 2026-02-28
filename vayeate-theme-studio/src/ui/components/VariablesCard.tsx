import { useState } from 'react';
import type { ColorVariable, ColorVariableKey, ContrastVariable } from '../../model/schemas';
import { colorVariableKeySchema, contrastVariableKeySchema } from '../../model/schemas';

interface VariablesCardProps {
  colorVariables: readonly ColorVariable[];
  contrastVariables: readonly ContrastVariable[];
  referencedColorVarKeys: Set<string>;
  referencedContrastVarKeys: Set<string>;
  canEdit: boolean;
  onAddColorVariable: (key: string) => void;
  onRemoveColorVariable: (key: string) => void;
  onAddContrastVariable: (key: string) => void;
  onRemoveContrastVariable: (key: string) => void;
  onUpdateContrastComparisonSource: (key: string, ref: ColorVariableKey | null) => void;
}

function isValidVariableKey(value: string, type: 'color' | 'contrast'): boolean {
  const schema = type === 'color' ? colorVariableKeySchema : contrastVariableKeySchema;
  return schema.safeParse(value).success;
}

function ColorVariablesSection({
  colorVariables,
  referencedKeys,
  canEdit,
  onAdd,
  onRemove,
}: {
  colorVariables: readonly ColorVariable[];
  referencedKeys: Set<string>;
  canEdit: boolean;
  onAdd: (key: string) => void;
  onRemove: (key: string) => void;
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
        <span className="tree-label">Color Variables</span>
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
                onChange={(e) => setNewKey(e.target.value)}
              />
              <button
                type="button"
                className="btn-icon btn-add-icon"
                title="Add"
                disabled={!isValidVariableKey(newKey.trim(), 'color')}
                onClick={() => {
                  const key = newKey.trim();
                  if (isValidVariableKey(key, 'color')) {
                    onAdd(key);
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

function ContrastVariablesSection({
  contrastVariables,
  colorVariables,
  referencedKeys,
  canEdit,
  onAdd,
  onRemove,
  onUpdateComparisonSource,
}: {
  contrastVariables: readonly ContrastVariable[];
  colorVariables: readonly ColorVariable[];
  referencedKeys: Set<string>;
  canEdit: boolean;
  onAdd: (key: string) => void;
  onRemove: (key: string) => void;
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
        <span className="tree-label">Contrast Variables</span>
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
                    onAdd(key);
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

function matchesSearch(key: string, searchQuery: string): boolean {
  const q = searchQuery.trim().toLowerCase();
  return !q || key.toLowerCase().includes(q);
}

export function VariablesCard({
  colorVariables,
  contrastVariables,
  referencedColorVarKeys,
  referencedContrastVarKeys,
  canEdit,
  onAddColorVariable,
  onRemoveColorVariable,
  onAddContrastVariable,
  onRemoveContrastVariable,
  onUpdateContrastComparisonSource,
}: VariablesCardProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredColorVariables = colorVariables
    .filter((v) => matchesSearch(v.key, searchQuery))
    .sort((a, b) => a.key.localeCompare(b.key));
  const filteredContrastVariables = contrastVariables
    .filter((v) => matchesSearch(v.key, searchQuery))
    .sort((a, b) => a.key.localeCompare(b.key));
  const sortedColorVariables = [...colorVariables].sort((a, b) => a.key.localeCompare(b.key));

  return (
    <div className="tokens-card placeholder">
      <h2>Variables</h2>
      <input
        type="text"
        className="card-search-input"
        placeholder="Search…"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        aria-label="Search variables"
      />
      <ColorVariablesSection
        colorVariables={filteredColorVariables}
        referencedKeys={referencedColorVarKeys}
        canEdit={canEdit}
        onAdd={onAddColorVariable}
        onRemove={onRemoveColorVariable}
      />
      <ContrastVariablesSection
        contrastVariables={filteredContrastVariables}
        colorVariables={sortedColorVariables}
        referencedKeys={referencedContrastVarKeys}
        canEdit={canEdit}
        onAdd={onAddContrastVariable}
        onRemove={onRemoveContrastVariable}
        onUpdateComparisonSource={onUpdateContrastComparisonSource}
      />
    </div>
  );
}
