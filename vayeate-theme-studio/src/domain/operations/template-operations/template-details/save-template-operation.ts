import { singleton } from 'tsyringe';
import type { Template } from '../../../../model/schema/template-schemas';
import { TemplateGateway } from '../../../../gateway/template/template-gateway';
import { EnqueueBackgroundQueueActionOperation } from '../../background-queue/enqueue-background-queue-action-operation';

@singleton()
export class SaveTemplateOperation {
  constructor(
    private readonly templateGateway: TemplateGateway,
    private readonly enqueueBackgroundAction: EnqueueBackgroundQueueActionOperation,
  ) {}

  /** Persist template to disk only. Single responsibility: save. */
  execute(template: Template): void {
    this.enqueueBackgroundAction.execute(
      `Saving template ${template.name} ${template.version}`,
      async () => {
        await this.templateGateway.saveTemplate(template);
      },
      undefined,
      'worker',
    );
  }
}


