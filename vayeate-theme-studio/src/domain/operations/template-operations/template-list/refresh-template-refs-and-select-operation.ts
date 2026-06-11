import { singleton } from 'tsyringe';
import type { Template } from '../../../../model/schema/template-schemas';
import type { BackgroundQueueContinuation as ContinuationHandler } from '../../../../model/background-queue';
import { TemplateGateway } from '../../../../gateway/template/template-gateway';
import { TemplatesStore } from '../../../state/data/templates-store';
import { TemplateUiStore } from '../../../state/ui/template-ui-store';
import { EnqueueBackgroundQueueActionOperation } from '../../background-queue/enqueue-background-queue-action-operation';

const noopContinuation: ContinuationHandler = {
  onQueue: () => noopContinuation,
  then: () => {},
};

/**
 * Refreshes template refs and select from persistence or derived state.
 */

@singleton()
export class RefreshTemplateRefsAndSelectOperation {
  constructor(
    private readonly templatesStore: TemplatesStore,
    private readonly templateUiStore: TemplateUiStore,
    private readonly templateGateway: TemplateGateway,
    private readonly enqueueBackgroundAction: EnqueueBackgroundQueueActionOperation,
  ) {}

  /**
   * Runs the refresh template refs and select mutation.
   * @param selectName Select name (string).
   * @param selectVersion Select version (string).
   * @param template Template (Template).
   * @param refsChanged Refs changed (unknown).
   * @returns Background-queue continuation for chained async work.
   */

  execute(
    selectName?: string,
    selectVersion?: string,
    template?: Template,
    refsChanged = true,
  ): ContinuationHandler {
    if (selectName && selectVersion && template) {
      this.templateUiStore.getStore().selectTemplate({ name: selectName, version: selectVersion });
      this.templatesStore.getStore().updateTemplate(template);
      this.templateUiStore.getStore().setTemplateLoadState('loaded');
    }

    if (!refsChanged) {
      return noopContinuation;
    }

    return this.enqueueBackgroundAction.execute(
      'data_io',
      selectName && selectVersion
        ? `Refreshing template refs for ${selectName} ${selectVersion}`
        : 'Refreshing template refs',
      async () => {
        const refs = await this.templateGateway.listTemplates();
        this.templatesStore.getStore().updateTemplateRefs(refs);
        if (selectName && selectVersion) {
          const match = refs.find((r) => r.name === selectName && r.version === selectVersion);
          if (match) {
            this.templateUiStore.getStore().selectTemplate(match);
          }
          if (!template) {
            const ref = match ?? { name: selectName, version: selectVersion };
            const loaded = await this.templateGateway.loadTemplate(ref.name, ref.version);
            if (loaded) {
              this.templatesStore.getStore().updateTemplate(loaded);
              this.templateUiStore.getStore().setTemplateLoadState('loaded');
            }
          }
        }
      }
    );
  }
}
