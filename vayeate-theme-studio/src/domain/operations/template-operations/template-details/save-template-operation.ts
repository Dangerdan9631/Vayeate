import { singleton } from 'tsyringe';
import type { Template } from '../../../../model/schema/template-schemas';
import { TemplateGateway } from '../../../../gateway/template/template-gateway';
import { EnqueueBackgroundQueueActionOperation } from '../../background-queue/enqueue-background-queue-action-operation';
import { ContinuationHandler } from '../../../../app/core/background-queue/continuation-handler';

@singleton()
export class SaveTemplateOperation {
  constructor(
    private readonly templateGateway: TemplateGateway,
    private readonly enqueueBackgroundAction: EnqueueBackgroundQueueActionOperation,
  ) {}

  execute(template: Template): ContinuationHandler {
    return this.enqueueBackgroundAction.execute(
      'worker',
      `Saving template ${template.name} ${template.version}`,
      async () => {
        await this.templateGateway.saveTemplate(template);
      }
    );
  }
}


