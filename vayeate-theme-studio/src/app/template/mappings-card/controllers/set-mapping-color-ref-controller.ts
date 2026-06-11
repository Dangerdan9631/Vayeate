import type { ColorVariableKey } from '../../../../model/schema/primitives';
import { TemplateUiStore } from '../../../../domain/state/ui/template-ui-store';
import type { TokenType } from '../../../../model/schema/primitives';
import { singleton } from 'tsyringe';
import { CatalogsStore, getAllLoadedCatalogs } from '../../../../domain/catalog/state/catalogs-store';
import { getCurrentTemplate, TemplatesStore } from '../../../../domain/state/data/templates-store';
import { isMappingOrphanForTemplate } from '../../../../domain/utils/is-mapping-orphan-for-template';
import { BumpTemplateVersionForEditOperation } from '../../../../domain/operations/template-operations/template-details/bump-template-version-for-edit-operation';
import { RemoveMappingFromTemplateOperation } from '../../../../domain/operations/template-operations/mappings/remove-mapping-from-template-operation';
import { SaveTemplateOperation } from '../../../../domain/operations/template-operations/template-details/save-template-operation';
import { SetMappingColorRefOperation as SetMappingColorRefOp } from '../../../../domain/operations/template-operations/mappings/set-mapping-color-ref-operation';
import { RefreshTemplateRefsAndSelectOperation } from '../../../../domain/operations/template-operations/template-list/refresh-template-refs-and-select-operation';
import { CatalogUiStore } from '../../../../domain/state/ui/catalog-ui-store';
import { ThemeUiStore } from '../../../../domain/state/ui/theme-ui-store';
import { RecordTemplateUndoOperation } from '../../../../domain/operations/undo-operations/record-template-undo-operation';
import { SetCurrentUndoStackIdOperation } from '../../../../domain/operations/undo-operations/set-current-undo-stack-id-operation';
import { entityRefsChanged } from '../../../../domain/utils/entity-refs-changed';
import { deriveUndoContext } from '../../../../model/undo-history';
import {
  TEMPLATE_MAPPING_COLOR_REF_SET,
  TEMPLATE_MAPPING_REMOVED,
} from '../../../../model/undo-action-types';

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
    const catalogs = getAllLoadedCatalogs(store.state.catalogs);
    const isOrphan = isMappingOrphanForTemplate(
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
