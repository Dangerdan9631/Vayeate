import { ColorVariableKey, ContrastVariableKey } from "../../../../../model/schema/primitives";

export enum VariablesCardActionType {
  VariablesSearchTextOnChange = 'TEMPLATE_VARIABLES_SEARCH_TEXT_ON_CHANGE',
  VariablesAddVariableNameTextOnChange = 'TEMPLATE_VARIABLES_ADD_VARIABLE_NAME_TEXT_ON_CHANGE',
  VariablesAddVariableButtonOnClick = 'TEMPLATE_VARIABLES_ADD_VARIABLE_BUTTON_ON_CLICK',
  VariablesGroupListOnCommit = 'TEMPLATE_VARIABLES_GROUP_LIST_ON_COMMIT',
  VariablesRemoveButtonOnClick = 'TEMPLATE_VARIABLES_REMOVE_BUTTON_ON_CLICK',
  VariablesContrastSourceListOnCommit = 'TEMPLATE_VARIABLES_CONTRAST_SOURCE_LIST_ON_COMMIT',
}

export type VariablesCardActions =
  | { type: VariablesCardActionType.VariablesSearchTextOnChange; value: string }
  | { type: VariablesCardActionType.VariablesAddVariableNameTextOnChange; value: string }
  | { type: VariablesCardActionType.VariablesAddVariableButtonOnClick; groupRef: string | null; variableKind: 'color' | 'contrast' }
  | { type: VariablesCardActionType.VariablesGroupListOnCommit; value: string; variableKey: string }
  | { type: VariablesCardActionType.VariablesRemoveButtonOnClick; key: ColorVariableKey | ContrastVariableKey }
  | { type: VariablesCardActionType.VariablesContrastSourceListOnCommit; value: ColorVariableKey | null; contrastVariableKey: ContrastVariableKey };
