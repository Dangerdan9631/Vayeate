import { singleton } from 'tsyringe';
import { TemplateGateway } from '../../../../gateway/template/template-gateway';
import { TemplatesStateSetter } from '../../../state/template/templates-state-reducer';
import { BackgroundQueueGateway } from '../../../../gateway/background-queue-gateway';

/** Load template refs from data dir into templates slice (template map entries from ref list). */
@singleton()
export class LoadTemplateRefsOperation {
  constructor(
    private readonly templatesStateSetter: TemplatesStateSetter,
    private readonly templateGateway: TemplateGateway,
    private readonly backgroundQueueGateway: BackgroundQueueGateway,
  ) {}

  execute(): void {
    this.backgroundQueueGateway.enqueue(async() => {
      const refs = await this.templateGateway.listTemplates();
      this.templatesStateSetter.apply({
        type: 'SET_TEMPLATE_MAP_ENTRIES',
        entries: refs.map((r) => ({ name: r.name, version: r.version, isLoaded: false, template: undefined })),
      });
    });
  }
}
