import { singleton } from 'tsyringe';
import { TemplateGateway } from '../../../../gateway/template/template-gateway';
import { EnqueueBackgroundQueueActionOperation } from '../../background-queue/enqueue-background-queue-action-operation';

/** Delete one template version from disk. Single responsibility: delete. */
@singleton()
export class DeleteTemplateOperation {
  constructor(
    private readonly templateGateway: TemplateGateway,
    private readonly enqueueBackgroundAction: EnqueueBackgroundQueueActionOperation,
  ) {}

  execute(name: string, version: string): void {
    this.enqueueBackgroundAction.execute(
      `Deleting template ${name} ${version}`,
      async () => {
        await this.templateGateway.deleteTemplate(name, version);
      },
      undefined,
      'worker',
    );
  }
}
