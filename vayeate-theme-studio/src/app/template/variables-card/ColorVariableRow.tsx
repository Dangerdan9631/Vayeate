import { memo, type ChangeEvent } from 'react';
import type { ColorVariable } from '../../../model/schema/template-schemas';

/**
 * Props for one color variable row in the template variables card.
 */
export interface ColorVariableRowProps {
  variable: ColorVariable;
  sortedGroups: readonly string[];
  isReferenced: boolean;
  canEdit: boolean;
  onUpdateGroupRef: (key: string, groupRef: string | null) => void;
  onRemove: (key: string) => void;
}

function ColorVariableRowComponent({
  variable,
  sortedGroups,
  isReferenced,
  canEdit,
  onUpdateGroupRef,
  onRemove,
}: ColorVariableRowProps) {
  function onColorVariableGroupRefChange(e: ChangeEvent<HTMLSelectElement>) {
    onUpdateGroupRef(variable.key, e.target.value || null);
  }

  function onRemoveColorVariableClick() {
    onRemove(variable.key);
  }

  return (
    <div className="variable-row">
      <select
        className="field-select mapping-var-select"
        value={variable.groupRef ?? ''}
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
      <span className="variable-name">{variable.key}</span>
      {canEdit && (
        <button
          type="button"
          className="btn-icon btn-danger-icon"
          title={isReferenced ? 'Cannot remove: variable is referenced' : 'Remove'}
          disabled={isReferenced}
          onClick={onRemoveColorVariableClick}
        >
          <span className="material-symbols-outlined">close</span>
        </button>
      )}
    </div>
  );
}

/**
 * Memoized row for one template color variable.
 */
export const ColorVariableRow = memo(ColorVariableRowComponent);
