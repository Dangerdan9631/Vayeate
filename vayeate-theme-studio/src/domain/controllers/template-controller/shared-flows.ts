import { injectable } from 'tsyringe';
import { LoadTemplate, RefreshTemplateRefs, SetSelectedTemplateRef } from '../../operations/template-operations';

@injectable()
export class TemplateSharedFlows {
  constructor(
    private readonly refreshTemplateRefs: RefreshTemplateRefs,
    private readonly setSelectedTemplateRef: SetSelectedTemplateRef,
    private readonly loadTemplate: LoadTemplate,
  ) {}

  async refreshRefsAndSelect(selectName?: string, selectVersion?: string): Promise<void> {
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
