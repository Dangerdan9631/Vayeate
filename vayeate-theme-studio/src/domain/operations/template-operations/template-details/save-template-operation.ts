import { singleton } from 'tsyringe';
import type { Template } from '../../../../model/schema/template-schemas';
import { TemplateGateway } from '../../../../gateway/template/template-gateway';
import { EnqueueBackgroundActionOperation } from '../../app-operations/enqueue-background-action-operation';

@singleton()
export class SaveTemplateOperation {
  constructor(
    private readonly templateGateway: TemplateGateway,
    private readonly backgroundQueueGateway: EnqueueBackgroundActionOperation,
  ) {}

  /** Persist template to disk only. Single responsibility: save. */
  execute(template: Template): void {
    this.backgroundQueueGateway.execute(async() => {
      await this.templateGateway.saveTemplate(template);
    }, `Saving template ${template.name} ${template.version}`);
  }
}


