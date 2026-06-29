import type { TemplateVariableKind } from "../../../../domain/state/ui/template-ui-state";
import type { ColorVariableKey, ContrastVariableKey } from "../../../../model/schema/primitives";
import { coalesceLatest, type ActionCoalesceFn } from '../../../core/action-queue/action-coalesce';
import { AppAction } from "../../../core/action-queue/app-action";

/**
 * Action type constants for the template variables card.
 */
export enum VariablesCardActionType {
  VariablesSearchTextOnChange = 'TEMPLATE_VARIABLES_SEARCH_TEXT_ON_CHANGE',
  VariablesAddVariableNameTextOnChange = 'TEMPLATE_VARIABLES_ADD_VARIABLE_NAME_TEXT_ON_CHANGE',
  VariablesAddVariableButtonOnClick = 'TEMPLATE_VARIABLES_ADD_VARIABLE_BUTTON_ON_CLICK',
  VariablesGroupListOnCommit = 'TEMPLATE_VARIABLES_GROUP_LIST_ON_COMMIT',
  VariablesRemoveButtonOnClick = 'TEMPLATE_VARIABLES_REMOVE_BUTTON_ON_CLICK',
  VariablesContrastSourceListOnCommit = 'TEMPLATE_VARIABLES_CONTRAST_SOURCE_LIST_ON_COMMIT',
}

/**
 * Union of variables card actions routed through VariablesCardHandler.
 */
export type VariablesCardActions =
  | { type: VariablesCardActionType.VariablesSearchTextOnChange; value: string }
  | {
      type: VariablesCardActionType.VariablesAddVariableNameTextOnChange;
      value: string;
      groupRef: string | null;
      variableKind: TemplateVariableKind;
    }
  | { type: VariablesCardActionType.VariablesAddVariableButtonOnClick; groupRef: string | null; variableKind: TemplateVariableKind }
  | { type: VariablesCardActionType.VariablesGroupListOnCommit; value: string; variableKey: string }
  | { type: VariablesCardActionType.VariablesRemoveButtonOnClick; key: ColorVariableKey | ContrastVariableKey }
  | { type: VariablesCardActionType.VariablesContrastSourceListOnCommit; value: ColorVariableKey | null; contrastVariableKey: ContrastVariableKey };


const variablesCardTypes = new Set<string>(Object.values(VariablesCardActionType));

/**
 * Narrows an app action to a variables card action when the type matches.
 * @param a Action from the shared action queue.
 * @returns True when the action is handled by VariablesCardHandler.
 */
export function isVariablesCardAction(a: AppAction): a is VariablesCardActions {
  return variablesCardTypes.has(a.type);
}

const variablesCardCoalescers: Partial<Record<VariablesCardActionType, ActionCoalesceFn>> = {
  [VariablesCardActionType.VariablesSearchTextOnChange]: coalesceLatest,
};

/**
 * Merges pending and incoming variables card actions when coalescing is supported.
 * @param pending Action already queued for the same control.
 * @param incoming New action replacing or updating the pending one.
 * @returns Coalesced variables card action, or null when no coalescing rule matches.
 */
export function tryCoalesceVariablesCardAction(
  pending: VariablesCardActions,
  incoming: VariablesCardActions,
): VariablesCardActions | null {
  const coalesce = variablesCardCoalescers[pending.type];
  return coalesce ? (coalesce(pending, incoming) as VariablesCardActions) : null;
}
