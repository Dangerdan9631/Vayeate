import type { TemplateReference } from '../../../../model/schema/theme-schemas';
import { TemplateGateway } from '../../../../gateway/template/template-gateway';
import { singleton } from 'tsyringe';
import { TemplatesStore } from '../../../state/data/templates-store';
import { EnqueueBackgroundQueueActionOperation } from '../../background-queue/enqueue-background-queue-action-operation';

/**
 * List templates and set entries in templates slice. Single responsibility: refresh ref list.
 */
@singleton()
export class RefreshTemplateRefsOperation {
  constructor(
    private readonly templatesStore: TemplatesStore,
    private readonly templateGateway: TemplateGateway,
    private readonly enqueueBackgroundQueue: EnqueueBackgroundQueueActionOperation,
  ) {}

  /**
   * Runs the refresh template refs mutation.
   * @returns Promise resolving to TemplateReference[].
   */

  execute(): Promise<TemplateReference[]> {
    return this.enqueueBackgroundQueue.executeReturning(
      'Refreshing template refs',
      async () => {
        const refs = await this.templateGateway.listTemplates();
        this.templatesStore.getStore().updateTemplateRefs(refs);
        return refs;
      },
      'data_io',
    );
  }
}
