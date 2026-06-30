import { singleton } from 'tsyringe';
import type { Template } from '../../../../model/schema/template-schemas';
import { templateDataFileKey } from '../../../../model/data-path-keys';
import { TemplateGateway } from '../../../../gateway/template/template-gateway';
import { getCurrentTemplate, TemplatesStore } from '../../../state/data/templates-store';
import { EnqueueBackgroundQueueActionOperation } from '../../background-queue/enqueue-background-queue-action-operation';

/**
 * Loads template snapshot from persistence into the store.
 */

@singleton()
export class LoadTemplateSnapshotOperation {
  constructor(
    private readonly templatesStore: TemplatesStore,
    private readonly templateGateway: TemplateGateway,
    private readonly enqueueBackgroundQueue: EnqueueBackgroundQueueActionOperation,
  ) {}

  /**
   * Runs the load template snapshot mutation.
   * @param name Name (string).
   * @param version Version (string).
   * @returns Promise resolving to Template | null.
   */

  execute(name: string, version: string): Promise<Template | null> {
    const ref = { name, version };
    const cached = getCurrentTemplate(this.templatesStore.getStore().state.templates, ref);
    if (cached) {
      return Promise.resolve(cached);
    }

    return this.enqueueBackgroundQueue.executeReturning(
      `Loading template snapshot ${name} ${version}`,
      async () => {
        const loaded = await this.templateGateway.loadTemplate(name, version);
        if (loaded) {
          this.templatesStore.getStore().updateTemplate(loaded);
        }
        return loaded;
      },
      'data_io',
      { key: templateDataFileKey(name, version), access: 'read' },
    );
  }
}
