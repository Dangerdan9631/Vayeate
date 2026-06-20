import { ColorVariableKey, ContrastVariableKey, TokenType } from "../../../../model/schema/primitives";
import { coalesceLatest, type ActionCoalesceFn } from '../../../core/action-queue/action-coalesce';
import { AppAction } from "../../../core/action-queue/app-action";
import type { TemplateMappingAssignment, TemplateMappingId } from '../../../../model/template-mapping-assignment';

/**
 * Action type constants for the template mappings card.
 */
export enum MappingsCardActionType {
  MappingSearchTextOnChange = 'TEMPLATE_MAPPING_SEARCH_TEXT_ON_CHANGE',
  MappingColorVariableFilterListOnSelect = 'TEMPLATE_MAPPING_COLOR_VARIABLE_FILTER_LIST_ON_SELECT',
  MappingContrastVariableFilterListOnSelect = 'TEMPLATE_MAPPING_CONTRAST_VARIABLE_FILTER_LIST_ON_SELECT',
  MappingExistingTokenGroupListOnCommit = 'TEMPLATE_MAPPING_EXISTING_TOKEN_GROUP_LIST_ON_COMMIT',
  MappingExistingTokenColorVariableListOnCommit = 'TEMPLATE_MAPPING_EXISTING_TOKEN_COLOR_VARIABLE_LIST_ON_COMMIT',
  MappingExistingTokenContrastVariableListOnCommit = 'TEMPLATE_MAPPING_EXISTING_TOKEN_CONTRAST_VARIABLE_LIST_ON_COMMIT',
  MappingSemanticTokenAddVariantButtonOnClick = 'TEMPLATE_MAPPING_SEMANTIC_TOKEN_ADD_VARIANT_BUTTON_ON_CLICK',
  MappingSemanticTokenModifierListOnCommit = 'TEMPLATE_MAPPING_SEMANTIC_TOKEN_MODIFIER_LIST_ON_COMMIT',
  MappingSemanticTokenLanguageListOnCommit = 'TEMPLATE_MAPPING_SEMANTIC_TOKEN_LANGUAGE_LIST_ON_COMMIT',
  MappingSemanticTokenVariantRemoveButtonOnClick = 'TEMPLATE_MAPPING_SEMANTIC_TOKEN_VARIANT_REMOVE_BUTTON_ON_CLICK',
  MappingSelectionOnToggle = 'TEMPLATE_MAPPING_SELECTION_ON_TOGGLE',
  MappingSelectionOnClear = 'TEMPLATE_MAPPING_SELECTION_ON_CLEAR',
  MappingSelectedAssignmentOnCommit = 'TEMPLATE_MAPPING_SELECTED_ASSIGNMENT_ON_COMMIT',
}

/**
 * Union of mappings card actions routed through MappingsCardHandler.
 */
export type MappingsCardActions =
  | { type: MappingsCardActionType.MappingSearchTextOnChange; value: string }
  | { type: MappingsCardActionType.MappingColorVariableFilterListOnSelect; values: ColorVariableKey[] }
  | { type: MappingsCardActionType.MappingContrastVariableFilterListOnSelect; values: ContrastVariableKey[] }
  | { type: MappingsCardActionType.MappingExistingTokenGroupListOnCommit; value: string; tokenKey: string; tokenType: TokenType }
  | { type: MappingsCardActionType.MappingExistingTokenColorVariableListOnCommit; value: ColorVariableKey; tokenKey: string; tokenType: TokenType }
  | { type: MappingsCardActionType.MappingExistingTokenContrastVariableListOnCommit; value: ContrastVariableKey | null; tokenKey: string; tokenType: TokenType }
  | { type: MappingsCardActionType.MappingSemanticTokenAddVariantButtonOnClick; semanticType: string; defaultGroupRef?: string | null }
  | { type: MappingsCardActionType.MappingSemanticTokenModifierListOnCommit; tokenKey: string; modifiers: string[] }
  | { type: MappingsCardActionType.MappingSemanticTokenLanguageListOnCommit; tokenKey: string; value: string | null }
  | { type: MappingsCardActionType.MappingSemanticTokenVariantRemoveButtonOnClick; tokenKey: string; tokenType: TokenType }
  | { type: MappingsCardActionType.MappingSelectionOnToggle; mappingId: TemplateMappingId }
  | { type: MappingsCardActionType.MappingSelectionOnClear }
  | { type: MappingsCardActionType.MappingSelectedAssignmentOnCommit; assignment: TemplateMappingAssignment };


const mappingsCardTypes = new Set<string>(Object.values(MappingsCardActionType));

/**
 * Narrows an app action to a mappings card action when the type matches.
 * @param a Action from the shared action queue.
 * @returns True when the action is handled by MappingsCardHandler.
 */
export function isMappingsCardAction(a: AppAction): a is MappingsCardActions {
  return mappingsCardTypes.has(a.type);
}

const mappingsCardCoalescers: Partial<Record<MappingsCardActionType, ActionCoalesceFn>> = {
  [MappingsCardActionType.MappingSearchTextOnChange]: coalesceLatest,
};

/**
 * Merges pending and incoming mappings card actions when coalescing is supported.
 * @param pending Action already queued for the same control.
 * @param incoming New action replacing or updating the pending one.
 * @returns Coalesced mappings card action, or null when no coalescing rule matches.
 */
export function tryCoalesceMappingsCardAction(
  pending: MappingsCardActions,
  incoming: MappingsCardActions,
): MappingsCardActions | null {
  const coalesce = mappingsCardCoalescers[pending.type];
  return coalesce ? (coalesce(pending, incoming) as MappingsCardActions) : null;
}
