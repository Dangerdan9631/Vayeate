import { singleton } from 'tsyringe';
import { TemplateGateway } from '../../../../gateway/template/template-gateway';
import { EnqueueBackgroundActionOperation } from '../../app-operations/enqueue-background-action-operation';

/** Delete one template version from disk. Single responsibility: delete. */
@singleton()
export class DeleteTemplateOperation {
  constructor(
    private readonly templateGateway: TemplateGateway,
    private readonly enqueueBackgroundAction: EnqueueBackgroundActionOperation,
  ) {}

    execute(name: string, version: string): void {
    this.enqueueBackgroundAction.execute(async() => {
      await this.templateGateway.deleteTemplate(name, version);
    }, `Deleting template ${name} ${version}`);
  }
}
