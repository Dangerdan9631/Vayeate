import { singleton } from 'tsyringe';
import type { Template } from '../../../../model/schema/template-schemas';
import { TemplateGateway } from '../../../../gateway/template/template-gateway';
import { BackgroundQueueGateway } from '../../../../gateway/background-queue-gateway';

@singleton()
export class SaveTemplateOperation {
  constructor(
    private readonly templateGateway: TemplateGateway,
    private readonly backgroundQueueGateway: BackgroundQueueGateway,
  ) {}

  /** Persist template to disk only. Single responsibility: save. */
  execute(template: Template): void {
    this.backgroundQueueGateway.enqueue(async() => {
      await this.templateGateway.saveTemplate(template);
    }, `Saving template ${template.name} ${template.version}`);
  }
}


