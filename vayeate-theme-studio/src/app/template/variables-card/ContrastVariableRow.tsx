import { memo, type ChangeEvent } from 'react';
import type { ColorVariableKey } from '../../../model/schema/primitives';
import type { ColorVariable, ContrastVariable } from '../../../model/schema/template-schemas';

/**
 * Props for one contrast variable row in the template variables card.
 */
export interface ContrastVariableRowProps {
  variable: ContrastVariable;
  colorVariables: readonly ColorVariable[];
  sortedGroups: readonly string[];
  isReferenced: boolean;
  canEdit: boolean;
  onUpdateGroupRef: (key: string, groupRef: string | null) => void;
  onUpdateComparisonSource: (key: string, ref: ColorVariableKey | null) => void;
  onRemove: (key: string) => void;
}

function ContrastVariableRowComponent({
  variable,
  colorVariables,
  sortedGroups,
  isReferenced,
  canEdit,
  onUpdateGroupRef,
  onUpdateComparisonSource,
  onRemove,
}: ContrastVariableRowProps) {
  function onContrastVariableGroupRefChange(e: ChangeEvent<HTMLSelectElement>) {
    onUpdateGroupRef(variable.key, e.target.value || null);
  }

  function onComparisonSourceChange(e: ChangeEvent<HTMLSelectElement>) {
    onUpdateComparisonSource(variable.key, e.target.value || null);
  }

  function onRemoveContrastVariableClick() {
    onRemove(variable.key);
  }

  return (
    <div className="variable-row">
      <select
        className="field-select mapping-var-select"
        value={variable.groupRef ?? ''}
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
      <span className="variable-name">{variable.key}</span>
      <select
        className="field-select variable-comparison-select"
        value={variable.comparisonSourceRef ?? ''}
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
          title={isReferenced ? 'Cannot remove: variable is referenced' : 'Remove'}
          disabled={isReferenced}
          onClick={onRemoveContrastVariableClick}
        >
          <span className="material-symbols-outlined">close</span>
        </button>
      )}
    </div>
  );
}

/**
 * Memoized row for one template contrast variable.
 */
export const ContrastVariableRow = memo(ContrastVariableRowComponent);
