import { singleton } from 'tsyringe';
import { TemplateGateway } from '../../../../gateway/template/template-gateway';
import { TemplatesStateSetter } from '../../../state/template/templates-state-reducer';
import { BackgroundQueueGateway } from '../../../../gateway/background-queue-gateway';

/** After template mutations, refresh refs from disk and optionally load the selected template. */
@singleton()
export class RefreshTemplateRefsAndSelectOperation {
  constructor(
    private readonly templatesStateSetter: TemplatesStateSetter,
    private readonly templateGateway: TemplateGateway,
    private readonly backgroundQueueGateway: BackgroundQueueGateway,
  ) {}

  execute(selectName?: string, selectVersion?: string): void {
    this.backgroundQueueGateway.enqueue(async() => {
    const refs = await this.templateGateway.listTemplates();
    this.templatesStateSetter.apply({
      type: 'SET_TEMPLATE_MAP_ENTRIES',
      entries: refs.map((r) => ({ name: r.name, version: r.version, isLoaded: false, template: undefined })),
    });
    if (selectName && selectVersion) {
      const match = refs.find((r) => r.name === selectName && r.version === selectVersion);
      if (match) {
        this.templatesStateSetter.apply({ type: 'SET_SELECTED_TEMPLATE_REF', ref: match });
        const template = await this.templateGateway.loadTemplate(match.name, match.version);
        this.templatesStateSetter.apply({ type: 'SET_TEMPLATE', template });
        }
      }
    });
  }
}
