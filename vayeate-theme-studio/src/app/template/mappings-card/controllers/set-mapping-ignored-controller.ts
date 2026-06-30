import type { TokenType } from '../../../../model/schema/primitives';
import { TemplateUiStore } from '../../../../domain/state/ui/template-ui-store';
import { singleton } from 'tsyringe';
import { getCurrentTemplate, TemplatesStore } from '../../../../domain/state/data/templates-store';
import { BumpTemplateVersionForEditOperation } from '../../../../domain/operations/template-operations/template-details/bump-template-version-for-edit-operation';
import { SaveTemplateOperation } from '../../../../domain/operations/template-operations/template-details/save-template-operation';
import { SetMappingIgnoredOperation } from '../../../../domain/operations/template-operations/mappings/set-mapping-ignored-operation';
import { RefreshTemplateRefsAndSelectOperation } from '../../../../domain/operations/template-operations/template-list/refresh-template-refs-and-select-operation';
import { CatalogUiStore } from '../../../../domain/state/ui/catalog-ui-store';
import { ThemeUiStore } from '../../../../domain/state/ui/theme-ui-store';
import { RecordTemplateUndoOperation } from '../../../../domain/operations/undo-operations/record-template-undo-operation';
import { SetCurrentUndoStackIdOperation } from '../../../../domain/operations/undo-operations/set-current-undo-stack-id-operation';
import { entityRefsChanged } from '../../../../domain/utils/entity-refs-changed';
import { deriveUndoContext } from '../../../../model/undo-history';
import { TEMPLATE_MAPPING_IGNORED_SET } from '../../../../model/undo-action-types';

/**
 * Handles toggling whether a template mapping is ignored.
 */
@singleton()
export class SetMappingIgnoredController {
  constructor(
    private readonly templatesStore: TemplatesStore,
    private readonly templateUiStore: TemplateUiStore,
    private readonly catalogUiStore: CatalogUiStore,
    private readonly themeUiStore: ThemeUiStore,
    private readonly bumpTemplateVersionForEdit: BumpTemplateVersionForEditOperation,
    private readonly setMappingIgnored: SetMappingIgnoredOperation,
    private readonly saveTemplate: SaveTemplateOperation,
    private readonly refreshTemplateRefsAndSelect: RefreshTemplateRefsAndSelectOperation,
    private readonly recordTemplateUndo: RecordTemplateUndoOperation,
    private readonly setCurrentUndoStackId: SetCurrentUndoStackIdOperation,
  ) {}

  /**
   * Updates the ignored flag for a token mapping and records undo.
   * @param tokenKey Token key from the mapping row.
   * @param tokenType Token type discriminant for the mapping row.
   * @param ignored Whether the mapping should be ignored.
   */
  async run(
    tokenKey: string,
    tokenType: TokenType,
    ignored: boolean,
  ): Promise<void> {
    const template = getCurrentTemplate(this.templatesStore.getStore().state.templates, this.templateUiStore.getStore().state.selectedRef);
    if (!template) return;

    this.setCurrentUndoStackId.executeForContext(deriveUndoContext({
      tabId: 'templates',
      templateRef: { name: template.name, version: template.version },
      catalogRef: this.catalogUiStore.getStore().state.selectedRef,
      themeRef: this.themeUiStore.getStore().state.selectedRef,
    }));

    const base = this.bumpTemplateVersionForEdit.execute(template);
    const next = this.setMappingIgnored.execute(base, tokenKey, tokenType, ignored);
    if (next === base) return;
    this.saveTemplate.execute(next);
    this.refreshTemplateRefsAndSelect.execute(next.name, next.version, next, entityRefsChanged(template, next));

    await this.recordTemplateUndo.execute({
      description: `${ignored ? 'Ignore' : 'Use'} ${tokenKey} mapping`,
      actionType: TEMPLATE_MAPPING_IGNORED_SET,
      target: `${template.name}@${template.version}:mapping:${tokenType}:${tokenKey}:ignored`,
      before: template,
      after: next,
    });
  }
}
