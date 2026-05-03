import { singleton } from 'tsyringe';
import { TemplateGateway } from '../../../../gateway/template/template-gateway';
import { TemplatesStore } from '../../../state/data/templates-store';
import { TemplateUiStore } from '../../../state/ui/template-ui-store';
import { EnqueueBackgroundQueueActionOperation } from '../../background-queue/enqueue-background-queue-action-operation';
import { ContinuationHandler } from '../../../../app/core/background-queue/continuation-handler';

@singleton()
export class LoadTemplateRefsOperation {
  constructor(
    private readonly templatesStore: TemplatesStore,
    private readonly templateUiStore: TemplateUiStore,
    private readonly templateGateway: TemplateGateway,
    private readonly enqueueBackgroundAction: EnqueueBackgroundQueueActionOperation,
  ) {}

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
