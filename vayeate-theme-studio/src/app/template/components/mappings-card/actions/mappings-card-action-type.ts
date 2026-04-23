import { ColorVariableKey, ContrastVariableKey, TokenType } from "../../../../../model/schema/primitives";
import { AppAction } from "../../../../core/actions/app-action";

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
}

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
  | { type: MappingsCardActionType.MappingSemanticTokenVariantRemoveButtonOnClick; tokenKey: string; tokenType: TokenType };


const mappingsCardTypes = new Set<string>(Object.values(MappingsCardActionType));

export function isMappingsCardAction(a: AppAction): a is MappingsCardActions {
  return mappingsCardTypes.has(a.type);
}
