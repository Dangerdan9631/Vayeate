import { CatalogName, ColorVariableKey, ContrastVariableKey, TemplateName, TokenType, Version } from "../../../model/schemas";

export enum TemplateActionType {
  TemplatePageOnLoad = 'TEMPLATE_PAGE_ON_LOAD',
  TemplateTemplatesListOnCommit = 'TEMPLATE_TEMPLATES_LIST_ON_COMMIT',
  TemplateTemplatesCreateButtonOnClick = 'TEMPLATE_TEMPLATES_CREATE_BUTTON_ON_CLICK',
  TemplateCreateDialogNameTextOnChange = 'TEMPLATE_CREATE_DIALOG_NAME_TEXT_ON_CHANGE',
  TemplateCreateDialogCancelButtonOnClick = 'TEMPLATE_CREATE_DIALOG_CANCEL_BUTTON_ON_CLICK',
  TemplateCreateDialogOkButtonOnClick = 'TEMPLATE_CREATE_DIALOG_OK_BUTTON_ON_CLICK',
  TemplateDetailsDeleteVersionButtonOnClick = 'TEMPLATE_DETAILS_DELETE_VERSION_BUTTON_ON_CLICK',
  TemplateDetailsLockButtonOnClick = 'TEMPLATE_DETAILS_LOCK_BUTTON_ON_CLICK',
  TemplateDetailsUpdateAllButtonOnClick = 'TEMPLATE_DETAILS_UPDATE_ALL_BUTTON_ON_CLICK',
  TemplateDetailsCatalogCheckboxOnToggle = 'TEMPLATE_DETAILS_CATALOG_CHECKBOX_ON_TOGGLE',
  TemplateDetailsCatalogVersionListOnCommit = 'TEMPLATE_DETAILS_CATALOG_VERSION_LIST_ON_COMMIT',
  TemplateMappingSearchTextOnChange = 'TEMPLATE_MAPPING_SEARCH_TEXT_ON_CHANGE',
  TemplateMappingColorVariableFilterListOnSelect = 'TEMPLATE_MAPPING_COLOR_VARIABLE_FILTER_LIST_ON_SELECT',
  TemplateMappingContrastVariableFilterListOnSelect = 'TEMPLATE_MAPPING_CONTRAST_VARIABLE_FILTER_LIST_ON_SELECT',
  TemplateMappingExistingTokenGroupListOnCommit = 'TEMPLATE_MAPPING_EXISTING_TOKEN_GROUP_LIST_ON_COMMIT',
  TemplateMappingExistingTokenColorVariableListOnCommit = 'TEMPLATE_MAPPING_EXISTING_TOKEN_COLOR_VARIABLE_LIST_ON_COMMIT',
  TemplateMappingExistingTokenContrastVariableListOnCommit = 'TEMPLATE_MAPPING_EXISTING_TOKEN_CONTRAST_VARIABLE_LIST_ON_COMMIT',
  TemplateMappingSemanticTokenAddVariantButtonOnClick = 'TEMPLATE_MAPPING_SEMANTIC_TOKEN_ADD_VARIANT_BUTTON_ON_CLICK',
  TemplateMappingSemanticTokenModifierListOnCommit = 'TEMPLATE_MAPPING_SEMANTIC_TOKEN_MODIFIER_LIST_ON_COMMIT',
  TemplateMappingSemanticTokenLanguageListOnCommit = 'TEMPLATE_MAPPING_SEMANTIC_TOKEN_LANGUAGE_LIST_ON_COMMIT',
  TemplateMappingSemanticTokenVariantRemoveButtonOnClick = 'TEMPLATE_MAPPING_SEMANTIC_TOKEN_VARIANT_REMOVE_BUTTON_ON_CLICK',
  TemplateGroupAddTextOnChange = 'TEMPLATE_GROUP_ADD_TEXT_ON_CHANGE',
  TemplateGroupAddButtonOnClick = 'TEMPLATE_GROUP_ADD_BUTTON_ON_CLICK',
  TemplateGroupRemoveButtonOnClick = 'TEMPLATE_GROUP_REMOVE_BUTTON_ON_CLICK',
  TemplateVariablesSearchTextOnChange = 'TEMPLATE_VARIABLES_SEARCH_TEXT_ON_CHANGE',
  TemplateVariablesAddVariableNameTextOnChange = 'TEMPLATE_VARIABLES_ADD_VARIABLE_NAME_TEXT_ON_CHANGE',
  TemplateVariablesAddVariableButtonOnClick = 'TEMPLATE_VARIABLES_ADD_VARIABLE_BUTTON_ON_CLICK',
  TemplateVariablesGroupListOnCommit = 'TEMPLATE_VARIABLES_GROUP_LIST_ON_COMMIT',
  TemplateVariablesRemoveButtonOnClick = 'TEMPLATE_VARIABLES_REMOVE_BUTTON_ON_CLICK',
  TemplateVariablesContrastSourceListOnCommit = 'TEMPLATE_VARIABLES_CONTRAST_SOURCE_LIST_ON_COMMIT',
}

export type TemplateActions =
  | { type: TemplateActionType.TemplatePageOnLoad }
  | { type: TemplateActionType.TemplateTemplatesListOnCommit; name: TemplateName; version: Version }
  | { type: TemplateActionType.TemplateTemplatesCreateButtonOnClick }
  | { type: TemplateActionType.TemplateCreateDialogNameTextOnChange; value: string }
  | { type: TemplateActionType.TemplateCreateDialogCancelButtonOnClick }
  | { type: TemplateActionType.TemplateCreateDialogOkButtonOnClick }
  | { type: TemplateActionType.TemplateDetailsDeleteVersionButtonOnClick }
  | { type: TemplateActionType.TemplateDetailsLockButtonOnClick }
  | { type: TemplateActionType.TemplateDetailsUpdateAllButtonOnClick }
  | { type: TemplateActionType.TemplateDetailsCatalogCheckboxOnToggle; catalogName: CatalogName }
  | { type: TemplateActionType.TemplateDetailsCatalogVersionListOnCommit; value: Version; catalogName: CatalogName }
  | { type: TemplateActionType.TemplateMappingSearchTextOnChange; value: string }
  | { type: TemplateActionType.TemplateMappingColorVariableFilterListOnSelect; values: ColorVariableKey[] }
  | { type: TemplateActionType.TemplateMappingContrastVariableFilterListOnSelect; values: ContrastVariableKey[] }
  | { type: TemplateActionType.TemplateMappingExistingTokenGroupListOnCommit; value: string; tokenKey: string; tokenType: TokenType }
  | { type: TemplateActionType.TemplateMappingExistingTokenColorVariableListOnCommit; value: ColorVariableKey; tokenKey: string; tokenType: TokenType }
  | { type: TemplateActionType.TemplateMappingExistingTokenContrastVariableListOnCommit; value: ContrastVariableKey | null; tokenKey: string; tokenType: TokenType }
  | { type: TemplateActionType.TemplateMappingSemanticTokenAddVariantButtonOnClick; semanticType: string; defaultGroupRef?: string | null }
  | { type: TemplateActionType.TemplateMappingSemanticTokenModifierListOnCommit; tokenKey: string; modifiers: string[] }
  | { type: TemplateActionType.TemplateMappingSemanticTokenLanguageListOnCommit; tokenKey: string; value: string | null }
  | { type: TemplateActionType.TemplateMappingSemanticTokenVariantRemoveButtonOnClick; tokenKey: string; tokenType: TokenType }
  | { type: TemplateActionType.TemplateGroupAddTextOnChange; value: string }
  | { type: TemplateActionType.TemplateGroupAddButtonOnClick }
  | { type: TemplateActionType.TemplateGroupRemoveButtonOnClick; groupId: string }
  | { type: TemplateActionType.TemplateVariablesSearchTextOnChange; value: string }
  | { type: TemplateActionType.TemplateVariablesAddVariableNameTextOnChange; value: string }
  | { type: TemplateActionType.TemplateVariablesAddVariableButtonOnClick; groupRef: string | null; variableKind: 'color' | 'contrast' }
  | { type: TemplateActionType.TemplateVariablesGroupListOnCommit; value: string; variableKey: string }
  | { type: TemplateActionType.TemplateVariablesRemoveButtonOnClick; key: ColorVariableKey | ContrastVariableKey }
  | { type: TemplateActionType.TemplateVariablesContrastSourceListOnCommit; value: ColorVariableKey | null; contrastVariableKey: ContrastVariableKey };
