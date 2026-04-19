import type { TokenType } from '../../../model/schema/primitives';
import { singleton } from 'tsyringe';
import { TemplatesStore } from '../../../domain/state/template/templates-store';
import { BumpTemplateVersionForEditOperation } from '../../../domain/operations/template-operations/template-details/bump-template-version-for-edit-operation';
import { SaveTemplateOperation } from '../../../domain/operations/template-operations/template-details/save-template-operation';
import { SetMappingGroupRefOperation as SetMappingGroupRefOp } from '../../../domain/operations/template-operations/mappings/set-mapping-group-ref-operation';
import { RefreshTemplateRefsAndSelectOperation } from '../../../domain/operations/template-operations/template-list/refresh-template-refs-and-select-operation';

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
    this.saveTemplate.execute(next);
    this.refreshTemplateRefsAndSelect.execute(next.name, next.version);
  }
}
