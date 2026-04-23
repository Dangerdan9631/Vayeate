import type { AppAction } from '../../core/actions/app-action';
import type { TemplateActions } from './template-action-type';
import { isTemplatePageAction } from '../components/template-page/actions/template-page-action-guard';
import { isTemplatesCardAction } from '../components/templates-card/actions/templates-card-action-guard';
import { isTemplateCreateDialogAction } from '../components/create-template-dialog/actions/template-create-dialog-action-guard';
import { isTemplateDetailsCardAction } from '../components/template-details-card/actions/template-details-card-action-guard';
import { isTemplateCatalogsCardAction } from '../components/template-catalogs-card/actions/template-catalogs-card-action-guard';
import { isMappingsCardAction } from '../components/mappings-card/actions/mappings-card-action-guard';
import { isGroupsCardAction } from '../components/groups-card/actions/groups-card-action-guard';
import { isVariablesCardAction } from '../components/variables-card/actions/variables-card-action-guard';

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
