import { memo, type ChangeEvent } from 'react';
import type { ColorVariableKey, ContrastVariableKey, TokenType } from '../../../model/schema/primitives';
import type { ColorVariable, ContrastVariable, Mapping } from '../../../model/schema/template-schemas';

export interface MappingRowProps {
  mapping: Mapping;
  isOrphan: boolean;
  canEdit: boolean;
  sortedGroups: readonly string[];
  sortedColorVariables: readonly ColorVariable[];
  sortedContrastVariables: readonly ContrastVariable[];
  onUpdateGroupRef: (tokenKey: string, tokenType: TokenType, groupRef: string | null) => void;
  onUpdateColorRef: (tokenKey: string, tokenType: TokenType, ref: ColorVariableKey | null) => void;
  onUpdateContrastRef: (tokenKey: string, tokenType: TokenType, ref: ContrastVariableKey | null) => void;
}

function MappingRowComponent({
  mapping,
  isOrphan,
  canEdit,
  sortedGroups,
  sortedColorVariables,
  sortedContrastVariables,
  onUpdateGroupRef,
  onUpdateColorRef,
  onUpdateContrastRef,
}: MappingRowProps) {
  const isBlockingLock = !mapping.colorVariableRef;

  function onMappingGroupRefSelectChange(e: ChangeEvent<HTMLSelectElement>) {
    onUpdateGroupRef(mapping.token.key, mapping.token.type, e.target.value || null);
  }

  function onMappingColorRefSelectChange(e: ChangeEvent<HTMLSelectElement>) {
    onUpdateColorRef(mapping.token.key, mapping.token.type, e.target.value || null);
  }

  function onMappingContrastRefSelectChange(e: ChangeEvent<HTMLSelectElement>) {
    onUpdateContrastRef(mapping.token.key, mapping.token.type, e.target.value || null);
  }

  return (
    <div
      className={`mapping-row ${isOrphan ? 'mapping-orphan' : ''} ${isBlockingLock ? 'mapping-blocking-lock' : ''}`}
    >
      <select
        className="field-select mapping-var-select"
        value={mapping.groupRef ?? ''}
        disabled={!canEdit}
        onChange={onMappingGroupRefSelectChange}
        title="Group"
      >
        <option value="">Ungrouped</option>
        {sortedGroups.map((g) => (
          <option key={g} value={g}>
            {g}
          </option>
        ))}
      </select>
      <span className="mapping-token-name" title={mapping.token.key}>
        {mapping.token.key}
      </span>
      {isOrphan && (
        <span
          className="material-symbols-outlined mapping-warning-icon"
          title="Token not found in any included catalog"
        >
          warning
        </span>
      )}
      <select
        className="field-select mapping-var-select"
        value={mapping.colorVariableRef ?? ''}
        disabled={!canEdit}
        onChange={onMappingColorRefSelectChange}
      >
        <option value="">— color —</option>
        {sortedColorVariables.map((v) => (
          <option key={v.key} value={v.key}>
            {v.key}
          </option>
        ))}
      </select>
      <select
        className="field-select mapping-var-select"
        value={mapping.contrastVariableRef ?? ''}
        disabled={!canEdit}
        onChange={onMappingContrastRefSelectChange}
      >
        <option value="">— contrast —</option>
        {sortedContrastVariables.map((v) => (
          <option key={v.key} value={v.key}>
            {v.key}
          </option>
        ))}
      </select>
    </div>
  );
}

export const MappingRow = memo(MappingRowComponent);
