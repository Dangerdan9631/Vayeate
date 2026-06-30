import { TemplatePageActions } from "../template-page/actions/template-page-action-type";
import { TemplatesCardActions } from "../templates-card/actions/templates-card-action-type";
import { TemplateCreateDialogActions } from "../create-template-dialog/actions/template-create-dialog-action-type";
import { TemplateDetailsCardActions } from "../template-details-card/actions/template-details-card-action-type";
import { TemplateCatalogsCardActions } from "../template-catalogs-card/actions/template-catalogs-card-action-type";
import { MappingsCardActions } from "../mappings-card/actions/mappings-card-action-type";
import { GroupsCardActions } from "../groups-card/actions/groups-card-action-type";
import { VariablesCardActions } from "../variables-card/actions/variables-card-action-type";
import type { AppAction } from '../../core/action-queue/app-action';
import { isTemplatePageAction } from '../template-page/actions/template-page-action-type';
import { isTemplatesCardAction } from '../templates-card/actions/templates-card-action-type';
import { isTemplateDetailsCardAction } from '../template-details-card/actions/template-details-card-action-type';
import { isTemplateCatalogsCardAction } from '../template-catalogs-card/actions/template-catalogs-card-action-type';
import { isMappingsCardAction, tryCoalesceMappingsCardAction } from '../mappings-card/actions/mappings-card-action-type';
import { isGroupsCardAction, tryCoalesceGroupsCardAction } from '../groups-card/actions/groups-card-action-type';
import { isVariablesCardAction, tryCoalesceVariablesCardAction } from '../variables-card/actions/variables-card-action-type';
import { isTemplateCreateDialogAction, tryCoalesceTemplateCreateDialogAction } from '../create-template-dialog/actions/template-create-dialog-action-type';

/**
 * Union of all template-domain actions dispatched from the Templates UI.
 */
export type TemplateActions =
  | TemplatePageActions
  | TemplatesCardActions
  | TemplateCreateDialogActions
  | TemplateDetailsCardActions
  | TemplateCatalogsCardActions
  | MappingsCardActions
  | GroupsCardActions
  | VariablesCardActions;


/**
 * Narrows an app action to a template action when its type belongs to this domain.
 * @param a Action from the shared action queue.
 * @returns True when the action is handled by the template action handler.
 */
export function isTemplateAction(a: AppAction): a is TemplateActions {
  return (
    isTemplatePageAction(a) ||
    isTemplatesCardAction(a) ||
    isTemplateCreateDialogAction(a) ||
    isTemplateDetailsCardAction(a) ||
    isTemplateCatalogsCardAction(a) ||
    isMappingsCardAction(a) ||
    isGroupsCardAction(a) ||
    isVariablesCardAction(a)
  );
}

/**
 * Merges a pending and incoming template action when a feature coalescer applies.
 * @param pending Action already queued for the same control.
 * @param incoming New action replacing or updating the pending one.
 * @returns Coalesced template action, or null when no coalescing rule matches.
 */
export function tryCoalesceTemplateAction(pending: AppAction, incoming: AppAction): TemplateActions | null {
  if (isTemplateCreateDialogAction(pending) && isTemplateCreateDialogAction(incoming)) {
    return tryCoalesceTemplateCreateDialogAction(pending, incoming);
  }
  if (isMappingsCardAction(pending) && isMappingsCardAction(incoming)) {
    return tryCoalesceMappingsCardAction(pending, incoming);
  }
  if (isGroupsCardAction(pending) && isGroupsCardAction(incoming)) {
    return tryCoalesceGroupsCardAction(pending, incoming);
  }
  if (isVariablesCardAction(pending) && isVariablesCardAction(incoming)) {
    return tryCoalesceVariablesCardAction(pending, incoming);
  }
  return null;
}
