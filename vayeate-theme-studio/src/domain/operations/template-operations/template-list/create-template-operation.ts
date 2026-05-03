import type { Template } from '../../../../model/schema/template-schemas';
import { TemplateGateway } from '../../../../gateway/template/template-gateway';
import { singleton } from 'tsyringe';
import { EnqueueBackgroundQueueActionOperation } from '../../background-queue/enqueue-background-queue-action-operation';

@singleton()
export class CreateTemplateOperation {
  constructor(
    private readonly templateGateway: TemplateGateway,
    private readonly enqueueBackgroundQueue: EnqueueBackgroundQueueActionOperation,
  ) {}

  execute(params: { name: string }): Promise<Template> {
    return this.enqueueBackgroundQueue.executeReturning(`Creating template ${params.name}`, () =>
      this.templateGateway.createTemplate(params),
    );
  }
}



