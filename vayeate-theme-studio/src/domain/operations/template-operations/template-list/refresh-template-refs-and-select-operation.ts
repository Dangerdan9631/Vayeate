import { singleton } from 'tsyringe';
import { LoadTemplateOperation } from '../template-details/load-template-operation';
import { RefreshTemplateRefsOperation } from './refresh-template-refs-operation';
import { SetSelectedTemplateRefOperation } from './set-selected-template-ref-operation';

/** After template mutations, refresh refs from disk and optionally load the selected template. */
@singleton()
export class RefreshTemplateRefsAndSelectOperation {
  constructor(
    private readonly refreshTemplateRefs: RefreshTemplateRefsOperation,
    private readonly setSelectedTemplateRef: SetSelectedTemplateRefOperation,
    private readonly loadTemplate: LoadTemplateOperation,
  ) {}

  async execute(selectName?: string, selectVersion?: string): Promise<void> {
    const refs = await this.refreshTemplateRefs.execute();
    if (selectName && selectVersion) {
      const match = refs.find((r) => r.name === selectName && r.version === selectVersion);
      if (match) {
        this.setSelectedTemplateRef.execute(match);
        await this.loadTemplate.execute(match.name, match.version);
      }
    }
  }
}
