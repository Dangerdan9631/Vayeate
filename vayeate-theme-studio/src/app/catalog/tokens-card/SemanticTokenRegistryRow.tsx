import { memo, type FocusEvent } from 'react';
import type { SemanticTokenRegistryListKind } from '../../../model/schema/primitives';

/**
 * Props for one semantic registry list entry (type, modifier, or language).
 */
export interface SemanticTokenRegistryRowProps {
  label: string;
  value: string;
  inputAriaLabel: string;
  canEdit: boolean;
  registryList: SemanticTokenRegistryListKind;
  index: number;
  onSemanticRegistryTextCommit?: (
    registryList: SemanticTokenRegistryListKind,
    index: number,
    value: string,
  ) => void;
  onSemanticRegistryRemove?: (registryList: SemanticTokenRegistryListKind, index: number) => void;
}

/**
 * Renders one semantic registry entry with optional edit and remove controls.
 */
function SemanticTokenRegistryRowComponent({
  label,
  value,
  inputAriaLabel,
  canEdit,
  registryList,
  index,
  onSemanticRegistryTextCommit,
  onSemanticRegistryRemove,
}: SemanticTokenRegistryRowProps) {
  function onRowBlur(e: FocusEvent<HTMLInputElement>) {
    onSemanticRegistryTextCommit?.(registryList, index, e.target.value);
  }

  function onRemoveClick() {
    onSemanticRegistryRemove?.(registryList, index);
  }

  return (
    <div className="token-row">
      <span className="token-label">{label}</span>
      {canEdit && onSemanticRegistryTextCommit ? (
        <>
          <input
            className="token-input"
            type="text"
            defaultValue={value}
            onBlur={onRowBlur}
            aria-label={inputAriaLabel}
          />
          <button
            type="button"
            className="btn-icon btn-danger-icon"
            title="Remove"
            onClick={onRemoveClick}
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </>
      ) : (
        <span className="token-text">{value}</span>
      )}
    </div>
  );
}

/**
 * Memoized row for editing or displaying a semantic token registry value.
 */
export const SemanticTokenRegistryRow = memo(SemanticTokenRegistryRowComponent);
