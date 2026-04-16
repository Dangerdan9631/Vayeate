import { singleton } from 'tsyringe';
import { TemplateGateway } from '../../../../gateway/template/template-gateway';
import { TemplatesStore } from '../../../state/template/templates-store';
import { BackgroundQueueGateway } from '../../../../gateway/background-queue-gateway';

/** After template mutations, refresh refs from disk and optionally load the selected template. */
@singleton()
export class RefreshTemplateRefsAndSelectOperation {
  constructor(
    private readonly templatesStore: TemplatesStore,
    private readonly templateGateway: TemplateGateway,
    private readonly backgroundQueueGateway: BackgroundQueueGateway,
  ) {}

  execute(selectName?: string, selectVersion?: string): void {
    this.backgroundQueueGateway.enqueue(async() => {
    const refs = await this.templateGateway.listTemplates();
    this.templatesStore.getStore().setTemplateMapEntries(
      refs.map((r) => ({ name: r.name, version: r.version, isLoaded: false, template: undefined })),
    );
    if (selectName && selectVersion) {
      const match = refs.find((r) => r.name === selectName && r.version === selectVersion);
      if (match) {
        this.templatesStore.getStore().setSelectedRef(match);
        const template = await this.templateGateway.loadTemplate(match.name, match.version);
        this.templatesStore.getStore().setTemplate(template);
        }
      }
    }, `Refreshing template ${selectName} ${selectVersion}`);
  }
}
