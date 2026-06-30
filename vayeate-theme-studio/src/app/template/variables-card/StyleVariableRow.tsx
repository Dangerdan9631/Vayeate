import { memo, type ChangeEvent } from 'react';
import type { StyleVariable } from '../../../model/schema/template-schemas';

/**
 * Props for one style variable row in the template variables card.
 */
export interface StyleVariableRowProps {
  variable: StyleVariable;
  sortedGroups: readonly string[];
  isReferenced: boolean;
  canEdit: boolean;
  onUpdateGroupRef: (key: string, groupRef: string | null) => void;
  onRemove: (key: string) => void;
}

function StyleVariableRowComponent({
  variable,
  sortedGroups,
  isReferenced,
  canEdit,
  onUpdateGroupRef,
  onRemove,
}: StyleVariableRowProps) {
  function onStyleVariableGroupRefChange(e: ChangeEvent<HTMLSelectElement>) {
    onUpdateGroupRef(variable.key, e.target.value || null);
  }

  function onRemoveStyleVariableClick() {
    onRemove(variable.key);
  }

  return (
    <div className="variable-row">
      <select
        className="field-select mapping-var-select"
        value={variable.groupRef ?? ''}
        disabled={!canEdit}
        onChange={onStyleVariableGroupRefChange}
        title="Group"
      >
        <option value="">Ungrouped</option>
        {sortedGroups.map((g) => (
          <option key={g} value={g}>
            {g}
          </option>
        ))}
      </select>
      <span className="variable-name">{variable.key}</span>
      {canEdit && (
        <button
          type="button"
          className="btn-icon btn-danger-icon"
          title={isReferenced ? 'Cannot remove: variable is referenced' : 'Remove'}
          disabled={isReferenced}
          onClick={onRemoveStyleVariableClick}
        >
          <span className="material-symbols-outlined">close</span>
        </button>
      )}
    </div>
  );
}

/**
 * Memoized row for one template style variable.
 */
export const StyleVariableRow = memo(StyleVariableRowComponent);
