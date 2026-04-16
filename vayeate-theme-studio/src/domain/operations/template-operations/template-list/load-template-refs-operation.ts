import { singleton } from 'tsyringe';
import { TemplateGateway } from '../../../../gateway/template/template-gateway';
import { TemplatesStore } from '../../../state/template/templates-store';
import { BackgroundQueueGateway } from '../../../../gateway/background-queue-gateway';

/** Load template refs from data dir into templates slice (template map entries from ref list). */
@singleton()
export class LoadTemplateRefsOperation {
  constructor(
    private readonly templatesStore: TemplatesStore,
    private readonly templateGateway: TemplateGateway,
    private readonly backgroundQueueGateway: BackgroundQueueGateway,
  ) {}

  execute(): void {
    this.backgroundQueueGateway.enqueue(async() => {
      const refs = await this.templateGateway.listTemplates();
      this.templatesStore.getStore().setTemplateMapEntries(
        refs.map((r) => ({ name: r.name, version: r.version, isLoaded: false, template: undefined })),
      );
    }, 'Loading templates');
  }
}
