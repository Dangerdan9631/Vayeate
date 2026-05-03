import { singleton } from 'tsyringe';
import type { Template } from '../../../../model/schema/template-schemas';
import { TemplateGateway } from '../../../../gateway/template/template-gateway';
import { TemplatesStore } from '../../../state/data/templates-store';
import { TemplateUiStore } from '../../../state/ui/template-ui-store';
import { EnqueueBackgroundQueueActionOperation } from '../../background-queue/enqueue-background-queue-action-operation';

@singleton()
export class LoadTemplateOperation {
  constructor(
    private readonly templatesStore: TemplatesStore,
    private readonly templateUiStore: TemplateUiStore,
    private readonly templateGateway: TemplateGateway,
    private readonly enqueueBackgroundQueue: EnqueueBackgroundQueueActionOperation,
  ) {}

  execute(name: string, version: string): Promise<Template | null> {
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
    );
  }
}



