import type { TemplateReference } from '../../../../model/schemas';
import { TemplateGateway } from '../../../../gateway/template/template-gateway';
import { singleton } from 'tsyringe';
import { TemplatesStateSetter } from '../../../state/template/templates-state-reducer';

/** List templates and set entries in templates slice. Single responsibility: refresh ref list. */
@singleton()
export class RefreshTemplateRefsOperation {
  constructor(
    private readonly templatesStateSetter: TemplatesStateSetter,
    private readonly templateGateway: TemplateGateway,
  ) {}

  async execute(): Promise<TemplateReference[]> {
    const refs = await this.templateGateway.listTemplates();
    this.templatesStateSetter.apply({
      type: 'SET_TEMPLATE_MAP_ENTRIES',
      entries: refs.map((r) => ({ name: r.name, version: r.version, isLoaded: false, template: undefined })),
    });
    return refs;
  }
}
