import type { TokenType } from '../../../../model/schemas';
import { singleton } from 'tsyringe';
import { AppStateGetter } from '../../../state/app-state-getter';
import {
  BumpTemplateVersionForEditOperation,
  SaveTemplateOperation,
  SetMappingContrastRefOperation as SetMappingContrastRefOp,
} from '../../../operations/template-operations';
import { TemplateSharedFlows } from '../shared-flows';

@singleton()
export class SetMappingContrastRefController {
  constructor(
    private readonly appStateGetter: AppStateGetter,
    private readonly bumpTemplateVersionForEdit: BumpTemplateVersionForEditOperation,
    private readonly setMappingContrastRefOp: SetMappingContrastRefOp,
    private readonly saveTemplate: SaveTemplateOperation,
    private readonly templateSharedFlows: TemplateSharedFlows,
  ) {}

  async run(
    tokenKey: string,
    tokenType: TokenType,
    contrastVariableRef: string | null,
  ): Promise<void> {
    const template = this.appStateGetter.current().templates.template;
    if (!template) return;
    const base = this.bumpTemplateVersionForEdit.execute(template);
    const next = this.setMappingContrastRefOp.execute(base, tokenKey, tokenType, contrastVariableRef);
    await this.saveTemplate.execute(next);
    await this.templateSharedFlows.refreshRefsAndSelect(next.name, next.version);
  }
}
