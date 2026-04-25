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
import { isTemplateCreateDialogAction } from '../create-template-dialog/actions/template-create-dialog-action-type';
import { isTemplateDetailsCardAction } from '../template-details-card/actions/template-details-card-action-type';
import { isTemplateCatalogsCardAction } from '../template-catalogs-card/actions/template-catalogs-card-action-type';
import { isMappingsCardAction } from '../mappings-card/actions/mappings-card-action-type';
import { isGroupsCardAction } from '../groups-card/actions/groups-card-action-type';
import { isVariablesCardAction } from '../variables-card/actions/variables-card-action-type';

export type TemplateActions =
  | TemplatePageActions
  | TemplatesCardActions
  | TemplateCreateDialogActions
  | TemplateDetailsCardActions
  | TemplateCatalogsCardActions
  | MappingsCardActions
  | GroupsCardActions
  | VariablesCardActions;


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
