import type { TokenType } from '../../../../model/schemas';
import { singleton } from 'tsyringe';
import { AppStateGetter } from '../../../state/app-state-getter';
import {
  BumpTemplateVersionForEditOperation,
  RemoveMappingFromTemplateOperation,
  SaveTemplateOperation,
} from '../../../operations/template-operations';
import { TemplateSharedFlows } from '../shared-flows';

@singleton()
export class RemoveMappingController {
  constructor(
    private readonly appStateGetter: AppStateGetter,
    private readonly bumpTemplateVersionForEdit: BumpTemplateVersionForEditOperation,
    private readonly removeMappingFromTemplate: RemoveMappingFromTemplateOperation,
    private readonly saveTemplate: SaveTemplateOperation,
    private readonly templateSharedFlows: TemplateSharedFlows,
  ) {}

  async run(tokenKey: string, tokenType: TokenType): Promise<void> {
    const template = this.appStateGetter.current().templates.template;
    if (!template) return;
    const base = this.bumpTemplateVersionForEdit.execute(template);
    const next = this.removeMappingFromTemplate.execute(base, tokenKey, tokenType);
    await this.saveTemplate.execute(next);
    await this.templateSharedFlows.refreshRefsAndSelect(next.name, next.version);
  }
}
