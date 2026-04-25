import type { ColorVariableKey } from '../../../../model/schema/primitives';
import type { TokenType } from '../../../../model/schema/primitives';
import { singleton } from 'tsyringe';
import { CatalogsStore, getAllLoadedCatalogs } from '../../../../domain/catalog/state/catalogs-store';
import { TemplatesStore } from '../../../../domain/state/template/templates-store';
import { isMappingOrphanForTemplate } from '../../../../domain/utils/is-mapping-orphan-for-template';
import { BumpTemplateVersionForEditOperation } from '../../../../domain/operations/template-operations/template-details/bump-template-version-for-edit-operation';
import { RemoveMappingFromTemplateOperation } from '../../../../domain/operations/template-operations/mappings/remove-mapping-from-template-operation';
import { SaveTemplateOperation } from '../../../../domain/operations/template-operations/template-details/save-template-operation';
import { SetMappingColorRefOperation as SetMappingColorRefOp } from '../../../../domain/operations/template-operations/mappings/set-mapping-color-ref-operation';
import { RefreshTemplateRefsAndSelectOperation } from '../../../../domain/operations/template-operations/template-list/refresh-template-refs-and-select-operation';

@singleton()
export class SetMappingColorRefController {
  constructor(
    private readonly templatesStore: TemplatesStore,
    private readonly catalogsStore: CatalogsStore,
    private readonly bumpTemplateVersionForEdit: BumpTemplateVersionForEditOperation,
    private readonly removeMappingFromTemplate: RemoveMappingFromTemplateOperation,
    private readonly setMappingColorRefOp: SetMappingColorRefOp,
    private readonly saveTemplate: SaveTemplateOperation,
    private readonly refreshTemplateRefsAndSelect: RefreshTemplateRefsAndSelectOperation,
  ) {}

  async run(
    tokenKey: string,
    tokenType: TokenType,
    colorRef: ColorVariableKey | null,
  ): Promise<void> {
    const store = this.catalogsStore.getStore();
    const template = this.templatesStore.getStore().state.template;
    if (!template) return;
    const catalogs = getAllLoadedCatalogs(store);
    const isOrphan = isMappingOrphanForTemplate(
      template,
      tokenKey,
      tokenType,
      catalogs,
    );
    const base = this.bumpTemplateVersionForEdit.execute(template);
    if (colorRef === null && isOrphan) {
      const next = this.removeMappingFromTemplate.execute(base, tokenKey, tokenType);
      this.saveTemplate.execute(next);
      this.refreshTemplateRefsAndSelect.execute(next.name, next.version);
      return;
    }
    const next = this.setMappingColorRefOp.execute(base, tokenKey, tokenType, colorRef);
    this.saveTemplate.execute(next);
    this.refreshTemplateRefsAndSelect.execute(next.name, next.version);
  }
}
