import { memo, type ChangeEvent } from 'react';
import type { ColorVariableKey, ContrastVariableKey, StyleVariableKey, TokenType } from '../../../model/schema/primitives';
import type { ColorVariable, ContrastVariable, Mapping, StyleVariable } from '../../../model/schema/template-schemas';
import { isTemplateMappingBlockingLock } from '../../../domain/utils/is-template-mapping-complete';

/**
 * Props for a single non-semantic token mapping row.
 */
export interface MappingRowProps {
  mapping: Mapping;
  isOrphan: boolean;
  canEdit: boolean;
  sortedGroups: readonly string[];
  sortedColorVariables: readonly ColorVariable[];
  sortedContrastVariables: readonly ContrastVariable[];
  sortedStyleVariables: readonly StyleVariable[];
  onUpdateGroupRef: (tokenKey: string, tokenType: TokenType, groupRef: string | null) => void;
  onUpdateColorRef: (tokenKey: string, tokenType: TokenType, ref: ColorVariableKey | null) => void;
  onUpdateContrastRef: (tokenKey: string, tokenType: TokenType, ref: ContrastVariableKey | null) => void;
  onUpdateStyleRef: (tokenKey: string, tokenType: TokenType, ref: StyleVariableKey | null) => void;
  onUpdateIgnored: (tokenKey: string, tokenType: TokenType, ignored: boolean) => void;
  isSelected: boolean;
  onToggleSelection: (tokenKey: string, tokenType: TokenType) => void;
}

function MappingRowComponent({
  mapping,
  isOrphan,
  canEdit,
  sortedGroups,
  sortedColorVariables,
  sortedContrastVariables,
  sortedStyleVariables,
  onUpdateGroupRef,
  onUpdateColorRef,
  onUpdateContrastRef,
  onUpdateStyleRef,
  onUpdateIgnored,
  isSelected,
  onToggleSelection,
}: MappingRowProps) {
  const isBlockingLock = isTemplateMappingBlockingLock(mapping);
  const isIgnored = mapping.ignored === true;

  function onMappingGroupRefSelectChange(e: ChangeEvent<HTMLSelectElement>) {
    onUpdateGroupRef(mapping.token.key, mapping.token.type, e.target.value || null);
  }

  function onMappingColorRefSelectChange(e: ChangeEvent<HTMLSelectElement>) {
    onUpdateColorRef(mapping.token.key, mapping.token.type, e.target.value || null);
  }

  function onMappingContrastRefSelectChange(e: ChangeEvent<HTMLSelectElement>) {
    onUpdateContrastRef(mapping.token.key, mapping.token.type, e.target.value || null);
  }

  function onMappingStyleRefSelectChange(e: ChangeEvent<HTMLSelectElement>) {
    onUpdateStyleRef(mapping.token.key, mapping.token.type, e.target.value || null);
  }

  function onMappingSelectionClick() {
    onToggleSelection(mapping.token.key, mapping.token.type);
  }

  function onMappingIgnoredClick() {
    onUpdateIgnored(mapping.token.key, mapping.token.type, !isIgnored);
  }

  return (
    <div
      className={`mapping-row ${isSelected ? 'mapping-row-selected ' : ''}${isOrphan ? 'mapping-orphan' : ''} ${isBlockingLock ? 'mapping-blocking-lock' : ''}`}
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
        {canEdit && (
          <button
            type="button"
            role="checkbox"
            aria-checked={isSelected}
            aria-label={`Select mapping ${mapping.token.key}`}
            className="checkbox-icon-btn mapping-selection-btn"
            onClick={onMappingSelectionClick}
          >
            <span className="material-symbols-outlined" aria-hidden>
              {isSelected ? 'check_box' : 'check_box_outline_blank'}
            </span>
          </button>
        )}
        {mapping.token.key}
      </span>
      {canEdit && (
        <button
          type="button"
          role="checkbox"
          aria-checked={isIgnored}
          aria-label={`${isIgnored ? 'Use' : 'Ignore'} mapping ${mapping.token.key}`}
          className="checkbox-icon-btn mapping-ignored-btn"
          onClick={onMappingIgnoredClick}
          title={isIgnored ? 'Ignored' : 'Use in theme'}
        >
          <span className="material-symbols-outlined" aria-hidden>
            {isIgnored ? 'visibility_off' : 'visibility'}
          </span>
        </button>
      )}
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
        disabled={!canEdit || isIgnored}
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
        disabled={!canEdit || isIgnored}
        onChange={onMappingContrastRefSelectChange}
      >
        <option value="">— contrast —</option>
        {sortedContrastVariables.map((v) => (
          <option key={v.key} value={v.key}>
            {v.key}
          </option>
        ))}
      </select>
      <select
        className="field-select mapping-var-select"
        value={mapping.styleVariableRef ?? ''}
        disabled={!canEdit || isIgnored}
        onChange={onMappingStyleRefSelectChange}
      >
        <option value="">— style —</option>
        {sortedStyleVariables.map((v) => (
          <option key={v.key} value={v.key}>
            {v.key}
          </option>
        ))}
      </select>
    </div>
  );
}

/**
 * Memoized row component for editing one theme or textmate token mapping.
 */
export const MappingRow = memo(MappingRowComponent);
