import { singleton } from 'tsyringe';
import { templateDataFileKey } from '../../../../../model/Common/data-path-keys';
import { TemplateGateway } from '../../../../../gateway/gateway/Template/template/template-gateway';
import { EnqueueBackgroundQueueActionOperation } from '../../../Common/background-queue/enqueue-background-queue-action-operation';
import type { BackgroundQueueContinuation as ContinuationHandler } from '../../../../../model/Common/background-queue';

/**
 * Deletes template and refreshes related list or selection state.
 */

@singleton()
export class DeleteTemplateOperation {
  constructor(
    private readonly templateGateway: TemplateGateway,
    private readonly enqueueBackgroundAction: EnqueueBackgroundQueueActionOperation,
  ) {}

  /**
   * Runs the delete template mutation.
   * @param name Name (string).
   * @param version Version (string).
   * @returns Background-queue continuation for chained async work.
   */

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
