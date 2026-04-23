import { AppAction } from "../../../../core/actions/app-action";
import { VariablesCardActions, VariablesCardActionType } from "./variables-card-action-type";

const variablesCardTypes = new Set<string>(Object.values(VariablesCardActionType));

export function isVariablesCardAction(a: AppAction): a is VariablesCardActions {
  return variablesCardTypes.has(a.type);
}
