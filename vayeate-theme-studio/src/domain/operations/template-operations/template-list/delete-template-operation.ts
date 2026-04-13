import { singleton } from 'tsyringe';
import { TemplateGateway } from '../../../../gateway/template/template-gateway';
import { BackgroundQueueGateway } from '../../../../gateway/background-queue-gateway';

/** Delete one template version from disk. Single responsibility: delete. */
@singleton()
export class DeleteTemplateOperation {
  constructor(
    private readonly templateGateway: TemplateGateway,
    private readonly backgroundQueueGateway: BackgroundQueueGateway,
  ) {}

    execute(name: string, version: string): void {
    this.backgroundQueueGateway.enqueue(async() => {
      await this.templateGateway.deleteTemplate(name, version);
    }, `Deleting template ${name} ${version}`);
  }
}
