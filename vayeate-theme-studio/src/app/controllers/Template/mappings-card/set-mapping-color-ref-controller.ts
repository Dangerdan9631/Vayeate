import type { ColorVariableKey } from '../../../../model/Common/schema/primitives';
import { TemplateUiStore } from '../../../../domain/state/Template/ui/template-ui-store';
import type { TokenType } from '../../../../model/Common/schema/primitives';
import { singleton } from 'tsyringe';
import { CatalogsStore, getAllLoadedCatalogs } from '../../../../domain/state/Catalog/catalog/catalogs-store';
import { getCurrentTemplate, TemplatesStore } from '../../../../domain/state/Template/data/templates-store';
import { ValidateIsMappingOrphanForTemplate } from '../../../../domain/validations/Template/template-validations/validate-is-mapping-orphan-for-template';
import { BumpTemplateVersionForEditOperation } from '../../../../domain/operations/Template/template-operations/template-details/bump-template-version-for-edit-operation';
import { RemoveMappingFromTemplateOperation } from '../../../../domain/operations/Template/template-operations/mappings/remove-mapping-from-template-operation';
import { SaveTemplateOperation } from '../../../../domain/operations/Template/template-operations/template-details/save-template-operation';
import { SetMappingColorRefOperation as SetMappingColorRefOp } from '../../../../domain/operations/Template/template-operations/mappings/set-mapping-color-ref-operation';
import { RefreshTemplateRefsAndSelectOperation } from '../../../../domain/operations/Template/template-operations/template-list/refresh-template-refs-and-select-operation';
import { CatalogUiStore } from '../../../../domain/state/Catalog/ui/catalog-ui-store';
import { ThemeUiStore } from '../../../../domain/state/Theme/ui/theme-ui-store';
import { RecordTemplateUndoOperation } from '../../../../domain/operations/Template/template-undo-operations/record-template-undo-operation';
import { SetCurrentUndoStackIdOperation } from '../../../../domain/operations/Undo/undo-operations/set-current-undo-stack-id-operation';
import { entityRefsChanged } from '../../../../domain/utils/Common/entity-refs-changed';
import { deriveUndoContext } from '../../../../model/Undo/undo-history';
import {
  TEMPLATE_MAPPING_COLOR_REF_SET,
  TEMPLATE_MAPPING_REMOVED,
} from '../../../../model/Undo/undo-action-types';

/**
 * Handles TEMPLATE_MAPPING_EXISTING_TOKEN_COLOR_VARIABLE_LIST_ON_COMMIT by assigning a color variable.
 */
@singleton()
export class SetMappingColorRefController {
  constructor(
    private readonly templatesStore: TemplatesStore,
    private readonly templateUiStore: TemplateUiStore,
    private readonly catalogsStore: CatalogsStore,
    private readonly catalogUiStore: CatalogUiStore,
    private readonly themeUiStore: ThemeUiStore,
    private readonly bumpTemplateVersionForEdit: BumpTemplateVersionForEditOperation,
    private readonly validateIsMappingOrphanForTemplate: ValidateIsMappingOrphanForTemplate,
    private readonly removeMappingFromTemplate: RemoveMappingFromTemplateOperation,
    private readonly setMappingColorRefOp: SetMappingColorRefOp,
    private readonly saveTemplate: SaveTemplateOperation,
    private readonly refreshTemplateRefsAndSelect: RefreshTemplateRefsAndSelectOperation,
    private readonly recordTemplateUndo: RecordTemplateUndoOperation,
    private readonly setCurrentUndoStackId: SetCurrentUndoStackIdOperation,
  ) {}

  /**
   * Updates the color variable ref for a token mapping and records undo.
   * @param tokenKey Token key from the color variable list commit.
   * @param tokenType Token type discriminant for the mapping row.
   * @param colorRef Color variable ref chosen in the list, or null to clear.
   * @returns Resolves when the template update and undo recording finish.
   */
  async run(
    tokenKey: string,
    tokenType: TokenType,
    colorRef: ColorVariableKey | null,
  ): Promise<void> {
    const store = this.catalogsStore.getStore();
    const template = getCurrentTemplate(this.templatesStore.getStore().state.templates, this.templateUiStore.getStore().state.selectedRef);
    if (!template) return;
    if (
      template.mappings.some((m) =>
        m.token.key === tokenKey && m.token.type === tokenType && m.ignored === true
      )
    ) return;
    const catalogs = getAllLoadedCatalogs(store.state.catalogs);
    const isOrphan = this.validateIsMappingOrphanForTemplate.test(
      template,
      tokenKey,
      tokenType,
      catalogs,
    );

    this.setCurrentUndoStackId.executeForContext(deriveUndoContext({
      tabId: 'templates',
      templateRef: { name: template.name, version: template.version },
      catalogRef: this.catalogUiStore.getStore().state.selectedRef,
      themeRef: this.themeUiStore.getStore().state.selectedRef,
    }));

    const base = this.bumpTemplateVersionForEdit.execute(template);
    if (colorRef === null && isOrphan) {
      const next = this.removeMappingFromTemplate.execute(base, tokenKey, tokenType);
      this.saveTemplate.execute(next);
      this.refreshTemplateRefsAndSelect.execute(next.name, next.version, next, entityRefsChanged(template, next));
      await this.recordTemplateUndo.execute({
        description: `Remove orphan mapping ${tokenKey}`,
        actionType: TEMPLATE_MAPPING_REMOVED,
        target: `${template.name}@${template.version}:mapping:${tokenType}:${tokenKey}:color`,
        before: template,
        after: next,
      });
      return;
    }
    const next = this.setMappingColorRefOp.execute(base, tokenKey, tokenType, colorRef);
    if (next === base) return;
    this.saveTemplate.execute(next);
    this.refreshTemplateRefsAndSelect.execute(next.name, next.version, next, entityRefsChanged(template, next));
    await this.recordTemplateUndo.execute({
      description: `Set ${tokenKey} color variable`,
      actionType: TEMPLATE_MAPPING_COLOR_REF_SET,
      target: `${template.name}@${template.version}:mapping:${tokenType}:${tokenKey}:color`,
      before: template,
      after: next,
    });
  }
}
