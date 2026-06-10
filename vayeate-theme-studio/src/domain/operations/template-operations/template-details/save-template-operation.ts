import { singleton } from 'tsyringe';
import type { Template } from '../../../../model/schema/template-schemas';
import { templateDataFileKey } from '../../../../model/data-path-keys';
import { TemplateGateway } from '../../../../gateway/template/template-gateway';
import { EnqueueBackgroundQueueActionOperation } from '../../background-queue/enqueue-background-queue-action-operation';
import type { BackgroundQueueContinuation as ContinuationHandler } from '../../../../model/background-queue';

@singleton()
export class SaveTemplateOperation {
  constructor(
    private readonly templateGateway: TemplateGateway,
    private readonly enqueueBackgroundAction: EnqueueBackgroundQueueActionOperation,
  ) {}

  execute(template: Template): ContinuationHandler {
    return this.enqueueBackgroundAction.execute(
      'data_io',
      `Saving template ${template.name} ${template.version}`,
      async () => {
        await this.templateGateway.saveTemplate(template);
      },
      { key: templateDataFileKey(template.name, template.version), access: 'write' },
    );
  }
}


