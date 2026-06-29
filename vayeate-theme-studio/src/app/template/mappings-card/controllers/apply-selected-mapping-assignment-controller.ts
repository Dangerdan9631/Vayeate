import { singleton } from 'tsyringe';
import { getAllLoadedCatalogs, CatalogsStore } from '../../../../domain/catalog/state/catalogs-store';
import { ApplyMappingAssignmentOperation } from '../../../../domain/operations/template-operations/mappings/apply-mapping-assignment-operation';
import { BumpTemplateVersionForEditOperation } from '../../../../domain/operations/template-operations/template-details/bump-template-version-for-edit-operation';
import { SaveTemplateOperation } from '../../../../domain/operations/template-operations/template-details/save-template-operation';
import { RefreshTemplateRefsAndSelectOperation } from '../../../../domain/operations/template-operations/template-list/refresh-template-refs-and-select-operation';
import { RecordTemplateUndoOperation } from '../../../../domain/operations/undo-operations/record-template-undo-operation';
import { SetCurrentUndoStackIdOperation } from '../../../../domain/operations/undo-operations/set-current-undo-stack-id-operation';
import { getCurrentTemplate, TemplatesStore } from '../../../../domain/state/data/templates-store';
import { CatalogUiStore } from '../../../../domain/state/ui/catalog-ui-store';
import { TemplateUiStore } from '../../../../domain/state/ui/template-ui-store';
import { ThemeUiStore } from '../../../../domain/state/ui/theme-ui-store';
import { entityRefsChanged } from '../../../../domain/utils/entity-refs-changed';
import type { TemplateMappingAssignment } from '../../../../model/template-mapping-assignment';
import { templateMappingIdKey } from '../../../../model/template-mapping-assignment';
import { deriveUndoContext } from '../../../../model/undo-history';
import {
  TEMPLATE_MAPPING_COLOR_REF_SET,
  TEMPLATE_MAPPING_CONTRAST_REF_SET,
  TEMPLATE_MAPPING_GROUP_REF_SET,
} from '../../../../model/undo-action-types';

function matchesSelectedFilters(
  mapping: { token: { key: string }; colorVariableRef: string | null; contrastVariableRef: string | null },
  searchText: string,
  colorFilter: readonly string[],
  contrastFilter: readonly string[],
): boolean {
  const searchQuery = searchText.trim().toLowerCase();
  if (searchQuery && !mapping.token.key.toLowerCase().includes(searchQuery)) return false;
  if (colorFilter.length > 0 && (!mapping.colorVariableRef || !colorFilter.includes(mapping.colorVariableRef))) {
    return false;
  }
  if (
    contrastFilter.length > 0
    && (!mapping.contrastVariableRef || !contrastFilter.includes(mapping.contrastVariableRef))
  ) {
    return false;
  }
  return true;
}

/** Applies one assignment to every currently selected mapping as one undoable edit. */
@singleton()
export class ApplySelectedMappingAssignmentController {
  constructor(
    private readonly templatesStore: TemplatesStore,
    private readonly templateUiStore: TemplateUiStore,
    private readonly catalogsStore: CatalogsStore,
    private readonly catalogUiStore: CatalogUiStore,
    private readonly themeUiStore: ThemeUiStore,
    private readonly applyAssignment: ApplyMappingAssignmentOperation,
    private readonly bumpTemplateVersionForEdit: BumpTemplateVersionForEditOperation,
    private readonly saveTemplate: SaveTemplateOperation,
    private readonly refreshTemplateRefsAndSelect: RefreshTemplateRefsAndSelectOperation,
    private readonly recordTemplateUndo: RecordTemplateUndoOperation,
    private readonly setCurrentUndoStackId: SetCurrentUndoStackIdOperation,
  ) {}

  async run(assignment: TemplateMappingAssignment): Promise<void> {
    const uiState = this.templateUiStore.getStore().state;
    const template = getCurrentTemplate(this.templatesStore.getStore().state.templates, uiState.selectedRef);
    if (!template || uiState.selectedMappingIds.length === 0) return;

    const selectedKeys = new Set(uiState.selectedMappingIds.map(templateMappingIdKey));
    const selectedVisibleMappingIds = template.mappings
      .filter((mapping) => selectedKeys.has(templateMappingIdKey({
        tokenKey: mapping.token.key,
        tokenType: mapping.token.type,
      })))
      .filter((mapping) => matchesSelectedFilters(
        mapping,
        uiState.mappingSearchText,
        uiState.mappingColorVariableFilter,
        uiState.mappingContrastVariableFilter,
      ))
      .map((mapping) => ({
        tokenKey: mapping.token.key,
        tokenType: mapping.token.type,
      }));
    if (selectedVisibleMappingIds.length === 0) return;

    const assigned = this.applyAssignment.execute({
      template,
      mappingIds: selectedVisibleMappingIds,
      assignment,
      catalogs: getAllLoadedCatalogs(this.catalogsStore.getStore().state.catalogs),
    });
    if (assigned === template) return;
    const next = this.bumpTemplateVersionForEdit.execute(assigned);

    this.setCurrentUndoStackId.executeForContext(deriveUndoContext({
      tabId: 'templates',
      templateRef: { name: template.name, version: template.version },
      catalogRef: this.catalogUiStore.getStore().state.selectedRef,
      themeRef: this.themeUiStore.getStore().state.selectedRef,
    }));
    this.saveTemplate.execute(next);
    this.refreshTemplateRefsAndSelect.execute(
      next.name,
      next.version,
      next,
      entityRefsChanged(template, next),
    );

    const actionType = assignment.kind === 'group'
      ? TEMPLATE_MAPPING_GROUP_REF_SET
      : assignment.kind === 'color'
        ? TEMPLATE_MAPPING_COLOR_REF_SET
        : TEMPLATE_MAPPING_CONTRAST_REF_SET;
    await this.recordTemplateUndo.execute({
      description: `Set ${selectedVisibleMappingIds.length} mapping ${assignment.kind} assignments`,
      actionType,
      target: `${template.name}@${template.version}:mappings:${assignment.kind}`,
      before: template,
      after: next,
    });
  }
}
