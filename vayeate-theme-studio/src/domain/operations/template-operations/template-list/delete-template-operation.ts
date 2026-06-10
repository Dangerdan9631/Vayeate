import { singleton } from 'tsyringe';
import { templateDataFileKey } from '../../../../model/data-path-keys';
import { TemplateGateway } from '../../../../gateway/template/template-gateway';
import { EnqueueBackgroundQueueActionOperation } from '../../background-queue/enqueue-background-queue-action-operation';
import type { BackgroundQueueContinuation as ContinuationHandler } from '../../../../model/background-queue';

@singleton()
export class DeleteTemplateOperation {
  constructor(
    private readonly templateGateway: TemplateGateway,
    private readonly enqueueBackgroundAction: EnqueueBackgroundQueueActionOperation,
  ) {}

  execute(name: string, version: string): ContinuationHandler {
    return this.enqueueBackgroundAction.execute(
      'data_io',
      `Deleting template ${name} ${version}`,
      async () => {
        await this.templateGateway.deleteTemplate(name, version);
      },
      { key: templateDataFileKey(name, version), access: 'write' },
    );
  }
}
