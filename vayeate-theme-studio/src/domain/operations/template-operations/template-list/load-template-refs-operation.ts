import { singleton } from 'tsyringe';
import { TemplateGateway } from '../../../../gateway/template/template-gateway';
import { TemplatesStore } from '../../../state/data/templates-store';
import { TemplateUiStore } from '../../../state/ui/template-ui-store';
import { EnqueueBackgroundQueueActionOperation } from '../../background-queue/enqueue-background-queue-action-operation';
import type { BackgroundQueueContinuation as ContinuationHandler } from '../../../../model/background-queue';

/**
 * Loads template refs from persistence into the store.
 */

@singleton()
export class LoadTemplateRefsOperation {
  constructor(
    private readonly templatesStore: TemplatesStore,
    private readonly templateUiStore: TemplateUiStore,
    private readonly templateGateway: TemplateGateway,
    private readonly enqueueBackgroundAction: EnqueueBackgroundQueueActionOperation,
  ) {}

  /**
   * Runs the load template refs mutation.
   * @returns Background-queue continuation for chained async work.
   */

  execute(): ContinuationHandler {
    this.templateUiStore.getStore().setPageLoadState('loading');

    return this.enqueueBackgroundAction.execute(
      'data_io',
      'Loading templates',
      async () => {
        const refs = await this.templateGateway.listTemplates();
        if (this.templateUiStore.getStore().state.pageLoadState === 'loading') {
          this.templateUiStore.getStore().setPageLoadState('loaded');
          this.templatesStore.getStore().updateTemplateRefs(refs);
        }
      }
    );
  }
}
