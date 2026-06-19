import { memo } from 'react';
import type { ColorVariableKey, ContrastVariableKey, TokenType } from '../../../model/schema/primitives';
import type { ColorVariable, ContrastVariable, Mapping } from '../../../model/schema/template-schemas';
import { SemanticVariantRow } from './SemanticVariantRow';

/**
 * Props for a semantic variant row rendered inside a virtualized list.
 */
export interface SemanticVariantListRowProps {
  mapping: Mapping;
  isOrphan: boolean;
  canEdit: boolean;
  sortedGroups: readonly string[];
  sortedColorVariables: readonly ColorVariable[];
  sortedContrastVariables: readonly ContrastVariable[];
  sortedSemanticTokenModifiers: readonly string[];
  sortedSemanticTokenLanguages: readonly string[];
  onUpdateGroupRef: (tokenKey: string, tokenType: TokenType, groupRef: string | null) => void;
  onUpdateColorRef: (tokenKey: string, tokenType: TokenType, ref: ColorVariableKey | null) => void;
  onUpdateContrastRef: (tokenKey: string, tokenType: TokenType, ref: ContrastVariableKey | null) => void;
  onRemoveMapping: (tokenKey: string, tokenType: TokenType) => void;
  commitSemanticModifiers: (oldKey: string, modifiers: string[]) => void;
  commitSemanticLanguage: (oldKey: string, language: string | null) => void;
  isModifierOpen: boolean;
  onOpenModifierDropdownForKey: (tokenKey: string) => void;
  onCloseModifierDropdown: () => void;
}

function SemanticVariantListRowComponent({
  mapping,
  isOrphan,
  canEdit,
  sortedGroups,
  sortedColorVariables,
  sortedContrastVariables,
  sortedSemanticTokenModifiers,
  sortedSemanticTokenLanguages,
  onUpdateGroupRef,
  onUpdateColorRef,
  onUpdateContrastRef,
  onRemoveMapping,
  commitSemanticModifiers,
  commitSemanticLanguage,
  isModifierOpen,
  onOpenModifierDropdownForKey,
  onCloseModifierDropdown,
}: SemanticVariantListRowProps) {
  function onOpenModifierDropdown() {
    onOpenModifierDropdownForKey(mapping.token.key);
  }

  return (
    <SemanticVariantRow
      mapping={mapping}
      isOrphan={isOrphan}
      canEdit={canEdit}
      sortedGroups={sortedGroups}
      sortedColorVariables={sortedColorVariables}
      sortedContrastVariables={sortedContrastVariables}
      sortedSemanticTokenModifiers={sortedSemanticTokenModifiers}
      sortedSemanticTokenLanguages={sortedSemanticTokenLanguages}
      onUpdateGroupRef={onUpdateGroupRef}
      commitSemanticModifiers={commitSemanticModifiers}
      commitSemanticLanguage={commitSemanticLanguage}
      isModifierOpen={isModifierOpen}
      onOpenModifierDropdown={onOpenModifierDropdown}
      onCloseModifierDropdown={onCloseModifierDropdown}
      onUpdateColorRef={onUpdateColorRef}
      onUpdateContrastRef={onUpdateContrastRef}
      onRemoveMapping={onRemoveMapping}
    />
  );
}

/**
 * Memoized wrapper for semantic variant rows in virtualized mapping lists.
 */
export const SemanticVariantListRow = memo(SemanticVariantListRowComponent);
