import { injectable } from 'tsyringe';
import {
  AddGroupAndClearInputController,
  AddSemanticVariantController,
  AddVariableController,
  ChangeCatalogVersionController,
  CloseCreateDialogController,
  CreateTemplateController,
  DeleteTemplateVersionController,
  LoadTemplatePageController,
  LockTemplateController,
  OpenCreateDialogController,
  RemoveGroupController,
  RemoveMappingController,
  RemoveVariableController,
  SaveTemplateController,
  SelectTemplateAndLoadController,
  SetCreateFormNameController,
  SetMappingColorRefController,
  SetMappingColorVariableFilterController,
  SetMappingContrastRefController,
  SetMappingContrastVariableFilterController,
  SetMappingGroupRefController,
  SetMappingSearchTextController,
  SetMappingTokenGroupSelectionController,
  SetTemplateAddGroupNameController,
  SetTemplateAddVariableNameController,
  SetVariablesSearchTextController,
  ToggleCatalogController,
  UpdateAllCatalogsController,
  UpdateContrastComparisonSourceController,
  UpdateSemanticVariantKeyController,
  UpdateVariableGroupRefController,
} from '../../domain/controllers/template-controller';
import type { ActionHandler, TemplateAction } from './handler-types';
import { TemplateActionType } from './action-types';

@injectable()
export class TemplateActionHandler implements ActionHandler<TemplateAction> {
  constructor(
    private readonly addGroupAndClearInput: AddGroupAndClearInputController,
    private readonly addSemanticVariant: AddSemanticVariantController,
    private readonly addVariable: AddVariableController,
    private readonly changeCatalogVersion: ChangeCatalogVersionController,
    private readonly closeCreateDialog: CloseCreateDialogController,
    private readonly createTemplate: CreateTemplateController,
    private readonly deleteTemplateVersion: DeleteTemplateVersionController,
    private readonly loadTemplatePage: LoadTemplatePageController,
    private readonly lockTemplate: LockTemplateController,
    private readonly openCreateDialog: OpenCreateDialogController,
    private readonly removeGroup: RemoveGroupController,
    private readonly removeMapping: RemoveMappingController,
    private readonly removeVariable: RemoveVariableController,
    private readonly saveTemplate: SaveTemplateController,
    private readonly selectTemplateAndLoad: SelectTemplateAndLoadController,
    private readonly setCreateFormName: SetCreateFormNameController,
    private readonly setMappingColorRef: SetMappingColorRefController,
    private readonly setMappingColorVariableFilter: SetMappingColorVariableFilterController,
    private readonly setMappingContrastRef: SetMappingContrastRefController,
    private readonly setMappingContrastVariableFilter: SetMappingContrastVariableFilterController,
    private readonly setMappingGroupRef: SetMappingGroupRefController,
    private readonly setMappingSearchText: SetMappingSearchTextController,
    private readonly setMappingTokenGroupSelection: SetMappingTokenGroupSelectionController,
    private readonly setTemplateAddGroupName: SetTemplateAddGroupNameController,
    private readonly setTemplateAddVariableName: SetTemplateAddVariableNameController,
    private readonly setVariablesSearchText: SetVariablesSearchTextController,
    private readonly toggleCatalog: ToggleCatalogController,
    private readonly updateAllCatalogs: UpdateAllCatalogsController,
    private readonly updateContrastComparisonSource: UpdateContrastComparisonSourceController,
    private readonly updateSemanticVariantKey: UpdateSemanticVariantKeyController,
    private readonly updateVariableGroupRef: UpdateVariableGroupRefController,
  ) {}

  async handle(action: TemplateAction): Promise<void> {
    switch (action.type) {
      case TemplateActionType.TemplatePageOnLoad:
        await this.loadTemplatePage.run();
        break;
      case TemplateActionType.TemplateTemplatesListOnCommit:
        await this.selectTemplateAndLoad.run(action.name, action.version);
        break;
      case TemplateActionType.TemplateTemplatesCreateButtonOnClick:
        this.openCreateDialog.run();
        break;
      case TemplateActionType.TemplateCreateDialogOnOpen:
        this.openCreateDialog.run();
        break;
      case TemplateActionType.TemplateCreateDialogNameTextOnChange:
        this.setCreateFormName.run(action.value);
        break;
      case TemplateActionType.TemplateCreateDialogCancelButtonOnClick:
        this.closeCreateDialog.run();
        break;
      case TemplateActionType.TemplateCreateDialogOkButtonOnClick:
        await this.createTemplate.run(action.params);
        break;
      case TemplateActionType.TemplateDetailsDeleteVersionButtonOnClick:
        await this.deleteTemplateVersion.run(action.name, action.version);
        break;
      case TemplateActionType.TemplateDetailsLockButtonOnClick:
        await this.lockTemplate.run();
        break;
      case TemplateActionType.TemplateDetailsUpdateAllButtonOnClick:
        await this.updateAllCatalogs.run();
        break;
      case TemplateActionType.TemplateDetailsCatalogCheckboxOnToggle:
        await this.toggleCatalog.run(action.catalogName, action.checked ?? true);
        break;
      case TemplateActionType.TemplateDetailsCatalogVersionListOnCommit:
        await this.changeCatalogVersion.run(action.catalogName, action.value);
        break;
      case TemplateActionType.TemplateDetailsSaveTemplate:
        await this.saveTemplate.run(action.template);
        break;
      case TemplateActionType.TemplateMappingSearchTextOnChange:
        this.setMappingSearchText.run(action.value);
        break;
      case TemplateActionType.TemplateMappingColorVariableFilterListOnSelect:
        this.setMappingColorVariableFilter.run(action.values);
        break;
      case TemplateActionType.TemplateMappingContrastVariableFilterListOnSelect:
        this.setMappingContrastVariableFilter.run(action.values);
        break;
      case TemplateActionType.TemplateMappingExistingTokenGroupListOnCommit:
        await this.setMappingGroupRef.run(action.tokenKey, action.tokenType, action.value || null);
        break;
      case TemplateActionType.TemplateMappingTokenGroupSelectionOnCommit:
        this.setMappingTokenGroupSelection.run(action.value);
        break;
      case TemplateActionType.TemplateMappingExistingTokenColorVariableListOnCommit:
        await this.setMappingColorRef.run(
          action.tokenKey,
          action.tokenType,
          action.value,
          action.isOrphan,
        );
        break;
      case TemplateActionType.TemplateMappingExistingTokenContrastVariableListOnCommit:
        await this.setMappingContrastRef.run(action.tokenKey, action.tokenType, action.value);
        break;
      case TemplateActionType.TemplateMappingSemanticTokenAddVariantButtonOnClick:
        await this.addSemanticVariant.run(
          action.semanticType,
          action.modifiers,
          action.language,
          action.defaultGroupRef,
        );
        break;
      case TemplateActionType.TemplateMappingSemanticTokenModifierListOnCommit:
        await this.updateSemanticVariantKey.run(action.tokenKey, action.modifiers, action.language);
        break;
      case TemplateActionType.TemplateMappingSemanticTokenLanguageListOnCommit:
        await this.updateSemanticVariantKey.run(action.tokenKey, action.modifiers, action.value ?? null);
        break;
      case TemplateActionType.TemplateMappingSemanticTokenVariantRemoveButtonOnClick:
        await this.removeMapping.run(action.tokenKey, action.tokenType);
        break;
      case TemplateActionType.TemplateGroupAddTextOnChange:
        this.setTemplateAddGroupName.run(action.value);
        break;
      case TemplateActionType.TemplateGroupAddButtonOnClick:
        await this.addGroupAndClearInput.run(action.name);
        break;
      case TemplateActionType.TemplateGroupRemoveButtonOnClick:
        await this.removeGroup.run(action.groupId);
        break;
      case TemplateActionType.TemplateVariablesSearchTextOnChange:
        this.setVariablesSearchText.run(action.value);
        break;
      case TemplateActionType.TemplateVariablesAddVariableNameTextOnChange:
        this.setTemplateAddVariableName.run(action.value);
        break;
      case TemplateActionType.TemplateVariablesAddVariableButtonOnClick:
        await this.addVariable.run(action.key, action.groupRef, action.variableKind);
        break;
      case TemplateActionType.TemplateVariablesGroupListOnCommit:
        await this.updateVariableGroupRef.run(action.variableKey, action.value || null);
        break;
      case TemplateActionType.TemplateVariablesRemoveButtonOnClick:
        await this.removeVariable.run(action.key);
        break;
      case TemplateActionType.TemplateVariablesContrastSourceListOnCommit:
        await this.updateContrastComparisonSource.run(action.contrastVariableKey, action.value);
        break;
    }
  }
}
