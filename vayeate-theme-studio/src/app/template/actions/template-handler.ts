import { delay, inject, singleton } from 'tsyringe';
import { TemplateActions } from './template-action-type';
import { TemplatePageHandler } from '../components/template-page/actions/template-page-handler';
import { isTemplatePageAction } from '../components/template-page/actions/template-page-action-type';
import { TemplatesCardHandler } from '../components/templates-card/actions/templates-card-handler';
import { isTemplatesCardAction } from '../components/templates-card/actions/templates-card-action-type';
import { TemplateCreateDialogHandler } from '../components/create-template-dialog/actions/template-create-dialog-handler';
import { isTemplateCreateDialogAction } from '../components/create-template-dialog/actions/template-create-dialog-action-type';
import { TemplateDetailsCardHandler } from '../components/template-details-card/actions/template-details-card-handler';
import { isTemplateDetailsCardAction } from '../components/template-details-card/actions/template-details-card-action-type';
import { TemplateCatalogsCardHandler } from '../components/template-catalogs-card/actions/template-catalogs-card-handler';
import { isTemplateCatalogsCardAction } from '../components/template-catalogs-card/actions/template-catalogs-card-action-type';
import { MappingsCardHandler } from '../components/mappings-card/actions/mappings-card-handler';
import { isMappingsCardAction } from '../components/mappings-card/actions/mappings-card-action-type';
import { GroupsCardHandler } from '../components/groups-card/actions/groups-card-handler';
import { isGroupsCardAction } from '../components/groups-card/actions/groups-card-action-type';
import { VariablesCardHandler } from '../components/variables-card/actions/variables-card-handler';
import { isVariablesCardAction } from '../components/variables-card/actions/variables-card-action-type';
import { Logger, LoggerFactory } from '../../../domain/utils/logger';

@singleton()
export class TemplateActionHandler {
  private readonly log: Logger;

  constructor(
    loggerFactory: LoggerFactory,
    @inject(delay(() => TemplatePageHandler)) private readonly templatePageHandler: TemplatePageHandler,
    @inject(delay(() => TemplatesCardHandler)) private readonly templatesCardHandler: TemplatesCardHandler,
    @inject(delay(() => TemplateCreateDialogHandler)) private readonly templateCreateDialogHandler: TemplateCreateDialogHandler,
    @inject(delay(() => TemplateDetailsCardHandler)) private readonly templateDetailsCardHandler: TemplateDetailsCardHandler,
    @inject(delay(() => TemplateCatalogsCardHandler)) private readonly templateCatalogsCardHandler: TemplateCatalogsCardHandler,
    @inject(delay(() => MappingsCardHandler)) private readonly mappingsCardHandler: MappingsCardHandler,
    @inject(delay(() => GroupsCardHandler)) private readonly groupsCardHandler: GroupsCardHandler,
    @inject(delay(() => VariablesCardHandler)) private readonly variablesCardHandler: VariablesCardHandler,
  ) {
    this.log = loggerFactory.create('TemplateActionHandler');
  }

  async handle(action: TemplateActions): Promise<void> {
    if (isTemplatePageAction(action)) {
      return this.templatePageHandler.handle(action);
    }

    if (isTemplatesCardAction(action)) {
      return this.templatesCardHandler.handle(action);
    }

    if (isTemplateCreateDialogAction(action)) {
      return this.templateCreateDialogHandler.handle(action);
    }

    if (isTemplateDetailsCardAction(action)) {
      return this.templateDetailsCardHandler.handle(action);
    }

    if (isTemplateCatalogsCardAction(action)) {
      return this.templateCatalogsCardHandler.handle(action);
    }

    if (isMappingsCardAction(action)) {
      return this.mappingsCardHandler.handle(action);
    }

    if (isGroupsCardAction(action)) {
      return this.groupsCardHandler.handle(action);
    }

    if (isVariablesCardAction(action)) {
      return this.variablesCardHandler.handle(action);
    }

    const _exhaustive: never = action;
    this.log.error('Unhandled action (TemplateAction union not exhaustive)', { action: _exhaustive });
  }
}
