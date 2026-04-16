import type { TokenType } from '../../../../model/schemas';
import { singleton } from 'tsyringe';
import { TemplatesStore } from '../../../state/template/templates-store';
import { BumpTemplateVersionForEditOperation } from '../../../operations/template-operations/template-details/bump-template-version-for-edit-operation';
import { SaveTemplateOperation } from '../../../operations/template-operations/template-details/save-template-operation';
import { SetMappingGroupRefOperation as SetMappingGroupRefOp } from '../../../operations/template-operations/mappings/set-mapping-group-ref-operation';
import { RefreshTemplateRefsAndSelectOperation } from '../../../operations/template-operations/template-list/refresh-template-refs-and-select-operation';

@singleton()
export class SetMappingGroupRefController {
  constructor(
    private readonly templatesStore: TemplatesStore,
    private readonly bumpTemplateVersionForEdit: BumpTemplateVersionForEditOperation,
    private readonly setMappingGroupRefOp: SetMappingGroupRefOp,
    private readonly saveTemplate: SaveTemplateOperation,
    private readonly refreshTemplateRefsAndSelect: RefreshTemplateRefsAndSelectOperation,
  ) {}

  async run(
    tokenKey: string,
    tokenType: TokenType,
    groupRef: string | null,
  ): Promise<void> {
    const template = this.templatesStore.getStore().state.template;
    if (!template) return;
    const base = this.bumpTemplateVersionForEdit.execute(template);
    const next = this.setMappingGroupRefOp.execute(base, tokenKey, tokenType, groupRef);
    await this.saveTemplate.execute(next);
    await this.refreshTemplateRefsAndSelect.execute(next.name, next.version);
  }
}
