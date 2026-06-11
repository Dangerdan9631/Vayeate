import type { Template } from '../../../../model/schema/template-schemas';
import { templateDataFileKey } from '../../../../model/data-path-keys';
import { TemplateGateway } from '../../../../gateway/template/template-gateway';
import { createTemplateWithParams } from '../../../../model/factories/template-factory';
import { singleton } from 'tsyringe';
import { EnqueueBackgroundQueueActionOperation } from '../../background-queue/enqueue-background-queue-action-operation';

/**
 * Creates template and updates list or selection state.
 */

@singleton()
export class CreateTemplateOperation {
  constructor(
    private readonly templateGateway: TemplateGateway,
    private readonly enqueueBackgroundQueue: EnqueueBackgroundQueueActionOperation,
  ) {}

  /**
   * Runs the create template mutation.
   * @param params Params ({ name: string }).
   * @returns Promise resolving to Template.
   */

  execute(params: { name: string }): Promise<Template> {
    const draft = createTemplateWithParams(params);
    return this.enqueueBackgroundQueue.executeReturning(
      `Creating template ${params.name}`,
      () => this.templateGateway.createTemplate(params),
      'data_io',
      { key: templateDataFileKey(draft.name, draft.version), access: 'write' },
    );
  }
}



