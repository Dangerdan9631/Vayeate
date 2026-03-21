import type { ColorVariableKey } from '../../../../model/schemas';
import type { TokenType } from '../../../../model/schemas';
import { singleton } from 'tsyringe';
import { AppStateGetter } from '../../../state/app-state-getter';
import {
  BumpTemplateVersionForEdit,
  RemoveMappingFromTemplate,
  SaveTemplate,
  SetMappingColorRef as SetMappingColorRefOp,
} from '../../../operations/template-operations';
import { TemplateSharedFlows } from '../shared-flows';

@singleton()
export class SetMappingColorRefController {
  constructor(
    private readonly appStateGetter: AppStateGetter,
    private readonly bumpTemplateVersionForEdit: BumpTemplateVersionForEdit,
    private readonly removeMappingFromTemplate: RemoveMappingFromTemplate,
    private readonly setMappingColorRefOp: SetMappingColorRefOp,
    private readonly saveTemplate: SaveTemplate,
    private readonly templateSharedFlows: TemplateSharedFlows,
  ) {}

  async run(
    tokenKey: string,
    tokenType: TokenType,
    colorRef: ColorVariableKey | null,
    isOrphan?: boolean,
  ): Promise<void> {
    const template = this.appStateGetter.current().templates.template;
    if (!template) return;
    const base = this.bumpTemplateVersionForEdit.execute(template);
    if (colorRef === null && isOrphan) {
      const next = this.removeMappingFromTemplate.execute(base, tokenKey, tokenType);
      await this.saveTemplate.execute(next);
      await this.templateSharedFlows.refreshRefsAndSelect(next.name, next.version);
      return;
    }
    const next = this.setMappingColorRefOp.execute(base, tokenKey, tokenType, colorRef);
    await this.saveTemplate.execute(next);
    await this.templateSharedFlows.refreshRefsAndSelect(next.name, next.version);
  }
}
