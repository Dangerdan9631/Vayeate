import { TemplatePageActions } from "../components/template-page/actions/template-page-action-type";
import { TemplatesCardActions } from "../components/templates-card/actions/templates-card-action-type";
import { TemplateCreateDialogActions } from "../components/create-template-dialog/actions/template-create-dialog-action-type";
import { TemplateDetailsCardActions } from "../components/template-details-card/actions/template-details-card-action-type";
import { TemplateCatalogsCardActions } from "../components/template-catalogs-card/actions/template-catalogs-card-action-type";
import { MappingsCardActions } from "../components/mappings-card/actions/mappings-card-action-type";
import { GroupsCardActions } from "../components/groups-card/actions/groups-card-action-type";
import { VariablesCardActions } from "../components/variables-card/actions/variables-card-action-type";
import type { AppAction } from '../../core/actions/app-action';
import { isTemplatePageAction } from '../components/template-page/actions/template-page-action-type';
import { isTemplatesCardAction } from '../components/templates-card/actions/templates-card-action-type';
import { isTemplateCreateDialogAction } from '../components/create-template-dialog/actions/template-create-dialog-action-type';
import { isTemplateDetailsCardAction } from '../components/template-details-card/actions/template-details-card-action-type';
import { isTemplateCatalogsCardAction } from '../components/template-catalogs-card/actions/template-catalogs-card-action-type';
import { isMappingsCardAction } from '../components/mappings-card/actions/mappings-card-action-type';
import { isGroupsCardAction } from '../components/groups-card/actions/groups-card-action-type';
import { isVariablesCardAction } from '../components/variables-card/actions/variables-card-action-type';

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
