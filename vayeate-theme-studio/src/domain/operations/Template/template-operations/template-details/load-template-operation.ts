import { singleton } from 'tsyringe';
import type { Template } from '../../../../../model/Template/schema/template-schemas';
import { templateDataFileKey } from '../../../../../model/Common/data-path-keys';
import { TemplateGateway } from '../../../../../gateway/gateway/Template/template/template-gateway';
import { getCurrentTemplate, TemplatesStore } from '../../../../state/Template/data/templates-store';
import { TemplateUiStore } from '../../../../state/Template/ui/template-ui-store';
import { EnqueueBackgroundQueueActionOperation } from '../../../Queue/background-queue/enqueue-background-queue-action-operation';

/**
 * Loads template from persistence into the store.
 */

@singleton()
export class LoadTemplateOperation {
  constructor(
    private readonly templatesStore: TemplatesStore,
    private readonly templateUiStore: TemplateUiStore,
    private readonly templateGateway: TemplateGateway,
    private readonly enqueueBackgroundQueue: EnqueueBackgroundQueueActionOperation,
  ) {}

  /**
   * Runs the load template mutation.
   * @param name Name (string).
   * @param version Version (string).
   * @returns Promise resolving to Template | null.
   */

  execute(name: string, version: string): Promise<Template | null> {
    const ref = { name, version };
    const cached = getCurrentTemplate(this.templatesStore.getStore().state.templates, ref);
    if (cached) {
      const selectedRef = this.templateUiStore.getStore().state.selectedRef;
      if (selectedRef?.name === name && selectedRef.version === version) {
        this.templateUiStore.getStore().setTemplateLoadState('loaded');
      }
      return Promise.resolve(cached);
    }

    return this.enqueueBackgroundQueue.executeReturning(
      `Loading template ${name} ${version}`,
      async () => {
        const loaded = await this.templateGateway.loadTemplate(name, version);
        if (loaded) {
          this.templatesStore.getStore().updateTemplate(loaded);
          const selectedRef = this.templateUiStore.getStore().state.selectedRef;
          if (selectedRef?.name === name && selectedRef.version === version) {
            this.templateUiStore.getStore().setTemplateLoadState('loaded');
          }
        }
        return loaded;
      },
      'data_io',
      { key: templateDataFileKey(name, version), access: 'read' },
    );
  }
}
