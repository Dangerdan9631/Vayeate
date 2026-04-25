import { delay, inject, singleton } from 'tsyringe';
import { TemplateActions } from './template-action-type';
import { TemplatePageHandler } from '../template-page/actions/template-page-handler';
import { isTemplatePageAction } from '../template-page/actions/template-page-action-type';
import { TemplatesCardHandler } from '../templates-card/actions/templates-card-handler';
import { isTemplatesCardAction } from '../templates-card/actions/templates-card-action-type';
import { TemplateCreateDialogHandler } from '../create-template-dialog/actions/template-create-dialog-handler';
import { isTemplateCreateDialogAction } from '../create-template-dialog/actions/template-create-dialog-action-type';
import { TemplateDetailsCardHandler } from '../template-details-card/actions/template-details-card-handler';
import { isTemplateDetailsCardAction } from '../template-details-card/actions/template-details-card-action-type';
import { TemplateCatalogsCardHandler } from '../template-catalogs-card/actions/template-catalogs-card-handler';
import { isTemplateCatalogsCardAction } from '../template-catalogs-card/actions/template-catalogs-card-action-type';
import { MappingsCardHandler } from '../mappings-card/actions/mappings-card-handler';
import { isMappingsCardAction } from '../mappings-card/actions/mappings-card-action-type';
import { GroupsCardHandler } from '../groups-card/actions/groups-card-handler';
import { isGroupsCardAction } from '../groups-card/actions/groups-card-action-type';
import { VariablesCardHandler } from '../variables-card/actions/variables-card-handler';
import { isVariablesCardAction } from '../variables-card/actions/variables-card-action-type';
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
