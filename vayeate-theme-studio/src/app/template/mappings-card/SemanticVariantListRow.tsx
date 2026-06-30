import { memo } from 'react';
import type { ColorVariableKey, ContrastVariableKey, StyleVariableKey, TokenType } from '../../../model/schema/primitives';
import type { ColorVariable, ContrastVariable, Mapping, StyleVariable } from '../../../model/schema/template-schemas';
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
  sortedStyleVariables: readonly StyleVariable[];
  sortedSemanticTokenModifiers: readonly string[];
  sortedSemanticTokenLanguages: readonly string[];
  onUpdateGroupRef: (tokenKey: string, tokenType: TokenType, groupRef: string | null) => void;
  onUpdateColorRef: (tokenKey: string, tokenType: TokenType, ref: ColorVariableKey | null) => void;
  onUpdateContrastRef: (tokenKey: string, tokenType: TokenType, ref: ContrastVariableKey | null) => void;
  onUpdateStyleRef: (tokenKey: string, tokenType: TokenType, ref: StyleVariableKey | null) => void;
  onUpdateIgnored: (tokenKey: string, tokenType: TokenType, ignored: boolean) => void;
  onRemoveMapping: (tokenKey: string, tokenType: TokenType) => void;
  commitSemanticModifiers: (oldKey: string, modifiers: string[]) => void;
  commitSemanticLanguage: (oldKey: string, language: string | null) => void;
  isModifierOpen: boolean;
  onOpenModifierDropdownForKey: (tokenKey: string) => void;
  onCloseModifierDropdown: () => void;
  isSelected: boolean;
  onToggleSelection: (tokenKey: string, tokenType: TokenType) => void;
}

function SemanticVariantListRowComponent({
  mapping,
  isOrphan,
  canEdit,
  sortedGroups,
  sortedColorVariables,
  sortedContrastVariables,
  sortedStyleVariables,
  sortedSemanticTokenModifiers,
  sortedSemanticTokenLanguages,
  onUpdateGroupRef,
  onUpdateColorRef,
  onUpdateContrastRef,
  onUpdateStyleRef,
  onUpdateIgnored,
  onRemoveMapping,
  commitSemanticModifiers,
  commitSemanticLanguage,
  isModifierOpen,
  onOpenModifierDropdownForKey,
  onCloseModifierDropdown,
  isSelected,
  onToggleSelection,
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
      sortedStyleVariables={sortedStyleVariables}
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
      onUpdateStyleRef={onUpdateStyleRef}
      onUpdateIgnored={onUpdateIgnored}
      onRemoveMapping={onRemoveMapping}
      isSelected={isSelected}
      onToggleSelection={onToggleSelection}
    />
  );
}

/**
 * Memoized wrapper for semantic variant rows in virtualized mapping lists.
 */
export const SemanticVariantListRow = memo(SemanticVariantListRowComponent);
