import type { TokenType } from '../../../../model/schemas';
import { singleton } from 'tsyringe';
import { AppStateGetter } from '../../../state/app-state-getter';
import {
  BumpTemplateVersionForEdit,
  SaveTemplate,
  SetMappingGroupRef as SetMappingGroupRefOp,
} from '../../../operations/template-operations';
import { TemplateSharedFlows } from '../shared-flows';

@singleton()
export class SetMappingGroupRefController {
  constructor(
    private readonly appStateGetter: AppStateGetter,
    private readonly bumpTemplateVersionForEdit: BumpTemplateVersionForEdit,
    private readonly setMappingGroupRefOp: SetMappingGroupRefOp,
    private readonly saveTemplate: SaveTemplate,
    private readonly templateSharedFlows: TemplateSharedFlows,
  ) {}

  async run(
    tokenKey: string,
    tokenType: TokenType,
    groupRef: string | null,
  ): Promise<void> {
    const template = this.appStateGetter.current().templates.template;
    if (!template) return;
    const base = this.bumpTemplateVersionForEdit.execute(template);
    const next = this.setMappingGroupRefOp.execute(base, tokenKey, tokenType, groupRef);
    await this.saveTemplate.execute(next);
    await this.templateSharedFlows.refreshRefsAndSelect(next.name, next.version);
  }
}
