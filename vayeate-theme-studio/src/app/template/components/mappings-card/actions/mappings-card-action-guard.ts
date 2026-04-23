import { AppAction } from "../../../../core/actions/app-action";
import { MappingsCardActions, MappingsCardActionType } from "./mappings-card-action-type";

const mappingsCardTypes = new Set<string>(Object.values(MappingsCardActionType));

export function isMappingsCardAction(a: AppAction): a is MappingsCardActions {
  return mappingsCardTypes.has(a.type);
}
