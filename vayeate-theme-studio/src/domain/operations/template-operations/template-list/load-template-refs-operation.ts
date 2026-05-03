import { singleton } from 'tsyringe';
import { TemplateGateway } from '../../../../gateway/template/template-gateway';
import { TemplatesStore } from '../../../state/data/templates-store';
import { EnqueueBackgroundQueueActionOperation } from '../../background-queue/enqueue-background-queue-action-operation';
import { ContinuationHandler } from '../../../../app/core/background-queue/background-queue';

@singleton()
export class LoadTemplateRefsOperation {
  constructor(
    private readonly templatesStore: TemplatesStore,
    private readonly templateGateway: TemplateGateway,
    private readonly enqueueBackgroundAction: EnqueueBackgroundQueueActionOperation,
  ) {}

  execute(): ContinuationHandler {
    return this.enqueueBackgroundAction.execute(
      'worker',
      'Loading templates',
      async () => {
        const refs = await this.templateGateway.listTemplates();
        this.templatesStore.getStore().updateTemplateRefs(refs);
      }
    );
  }
}
