import { singleton } from 'tsyringe';
import { TemplateGateway } from '../../../../gateway/template/template-gateway';
import { TemplatesStore } from '../../../state/template/templates-store';
import { EnqueueBackgroundQueueActionOperation } from '../../background-queue/enqueue-background-queue-action-operation';

/** Load template refs from data dir into templates slice (template map entries from ref list). */
@singleton()
export class LoadTemplateRefsOperation {
  constructor(
    private readonly templatesStore: TemplatesStore,
    private readonly templateGateway: TemplateGateway,
    private readonly enqueueBackgroundAction: EnqueueBackgroundQueueActionOperation,
  ) {}

  execute(): void {
    this.enqueueBackgroundAction.execute(
      'Loading templates',
      async () => {
        const refs = await this.templateGateway.listTemplates();
        this.templatesStore.getStore().setTemplateMapEntries(
          refs.map((r) => ({ name: r.name, version: r.version, isLoaded: false, template: undefined })),
        );
      },
      undefined,
      'worker',
    );
  }
}
