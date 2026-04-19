import { singleton } from 'tsyringe';
import { AddGroupAndClearInputController } from '../controllers/add-group-and-clear-input-controller';
import { RemoveGroupController } from '../controllers/remove-group-controller';
import { SetTemplateAddGroupNameController } from '../controllers/set-template-add-group-name-controller';
import { AddSemanticVariantController } from '../controllers/add-semantic-variant-controller';
import { UpdateSemanticVariantKeyController } from '../controllers/update-semantic-variant-key-controller';
import { RemoveMappingController } from '../controllers/remove-mapping-controller';
import { SetMappingColorRefController } from '../controllers/set-mapping-color-ref-controller';
import { SetMappingColorVariableFilterController } from '../controllers/set-mapping-color-variable-filter-controller';
import { SetMappingContrastRefController } from '../controllers/set-mapping-contrast-ref-controller';
import { SetMappingContrastVariableFilterController } from '../controllers/set-mapping-contrast-variable-filter-controller';
import { SetMappingGroupRefController } from '../controllers/set-mapping-group-ref-controller';
import { SetMappingSearchTextController } from '../controllers/set-mapping-search-text-controller';
import { ChangeCatalogVersionController } from '../controllers/change-catalog-version-controller';
import { LockTemplateController } from '../controllers/lock-template-controller';
import { ToggleCatalogController } from '../controllers/toggle-catalog-controller';
import { UpdateAllCatalogsController } from '../controllers/update-all-catalogs-controller';
import { CloseCreateDialogController } from '../controllers/close-create-dialog-controller';
import { CreateTemplateController } from '../controllers/create-template-controller';
import { DeleteCurrentTemplateVersionController } from '../controllers/delete-current-template-version-controller';
import { LoadTemplatePageController } from '../../common/controllers/load-template-page-controller';
import { OpenCreateDialogController } from '../controllers/open-create-dialog-controller';
import { SelectTemplateAndLoadController } from '../controllers/select-template-and-load-controller';
import { SetCreateFormNameController } from '../controllers/set-create-form-name-controller';
import { AddVariableController } from '../controllers/add-variable-controller';
import { RemoveVariableController } from '../controllers/remove-variable-controller';
import { SetTemplateAddVariableNameController } from '../controllers/set-template-add-variable-name-controller';
import { SetVariablesSearchTextController } from '../controllers/set-variables-search-text-controller';
import { UpdateVariableGroupRefController } from '../controllers/update-variable-group-ref-controller';
import { UpdateContrastComparisonSourceController } from '../controllers/update-contrast-comparison-source-controller';
import { TemplateActions, TemplateActionType } from './template-action-type';

@singleton()
export class TemplateActionHandler {
  constructor(
    private readonly addGroupAndClearInput: AddGroupAndClearInputController,
    private readonly addSemanticVariant: AddSemanticVariantController,
    private readonly addVariable: AddVariableController,
    private readonly changeCatalogVersion: ChangeCatalogVersionController,
    private readonly closeCreateDialog: CloseCreateDialogController,
    private readonly createTemplate: CreateTemplateController,
    private readonly deleteCurrentTemplateVersion: DeleteCurrentTemplateVersionController,
    private readonly loadTemplatePage: LoadTemplatePageController,
    private readonly lockTemplate: LockTemplateController,
    private readonly openCreateDialog: OpenCreateDialogController,
    private readonly removeGroup: RemoveGroupController,
    private readonly removeMapping: RemoveMappingController,
    private readonly removeVariable: RemoveVariableController,
    private readonly selectTemplateAndLoad: SelectTemplateAndLoadController,
    private readonly setCreateFormName: SetCreateFormNameController,
    private readonly setMappingColorRef: SetMappingColorRefController,
    private readonly setMappingColorVariableFilter: SetMappingColorVariableFilterController,
    private readonly setMappingContrastRef: SetMappingContrastRefController,
    private readonly setMappingContrastVariableFilter: SetMappingContrastVariableFilterController,
    private readonly setMappingGroupRef: SetMappingGroupRefController,
    private readonly setMappingSearchText: SetMappingSearchTextController,
    private readonly setTemplateAddGroupName: SetTemplateAddGroupNameController,
    private readonly setTemplateAddVariableName: SetTemplateAddVariableNameController,
    private readonly setVariablesSearchText: SetVariablesSearchTextController,
    private readonly toggleCatalog: ToggleCatalogController,
    private readonly updateAllCatalogs: UpdateAllCatalogsController,
    private readonly updateContrastComparisonSource: UpdateContrastComparisonSourceController,
    private readonly updateSemanticVariantKey: UpdateSemanticVariantKeyController,
    private readonly updateVariableGroupRef: UpdateVariableGroupRefController,
  ) {}

  async handle(action: TemplateActions): Promise<void> {
    switch (action.type) {
      case TemplateActionType.TemplatePageOnLoad:
        await this.loadTemplatePage.run();
        break;
      case TemplateActionType.TemplateTemplatesListOnCommit:
        await this.selectTemplateAndLoad.run(action.name, action.version);
        break;
      case TemplateActionType.TemplateTemplatesCreateButtonOnClick:
        await this.openCreateDialog.run();
        break;
      case TemplateActionType.TemplateCreateDialogNameTextOnChange:
        await this.setCreateFormName.run(action.value);
        break;
      case TemplateActionType.TemplateCreateDialogCancelButtonOnClick:
        await this.closeCreateDialog.run();
        break;
      case TemplateActionType.TemplateCreateDialogOkButtonOnClick:
        await this.createTemplate.run();
        break;
      case TemplateActionType.TemplateDetailsDeleteVersionButtonOnClick:
        await this.deleteCurrentTemplateVersion.run();
        break;
      case TemplateActionType.TemplateDetailsLockButtonOnClick:
        await this.lockTemplate.run();
        break;
      case TemplateActionType.TemplateDetailsUpdateAllButtonOnClick:
        await this.updateAllCatalogs.run();
        break;
      case TemplateActionType.TemplateDetailsCatalogCheckboxOnToggle:
        await this.toggleCatalog.run(action.catalogName);
        break;
      case TemplateActionType.TemplateDetailsCatalogVersionListOnCommit:
        await this.changeCatalogVersion.run(action.catalogName, action.value);
        break;
      case TemplateActionType.TemplateMappingSearchTextOnChange:
        await this.setMappingSearchText.run(action.value);
        break;
      case TemplateActionType.TemplateMappingColorVariableFilterListOnSelect:
        await this.setMappingColorVariableFilter.run(action.values);
        break;
      case TemplateActionType.TemplateMappingContrastVariableFilterListOnSelect:
        await this.setMappingContrastVariableFilter.run(action.values);
        break;
      case TemplateActionType.TemplateMappingExistingTokenGroupListOnCommit:
        await this.setMappingGroupRef.run(action.tokenKey, action.tokenType, action.value || null);
        break;
      case TemplateActionType.TemplateMappingExistingTokenColorVariableListOnCommit:
        await this.setMappingColorRef.run(action.tokenKey, action.tokenType, action.value || null);
        break;
      case TemplateActionType.TemplateMappingExistingTokenContrastVariableListOnCommit:
        await this.setMappingContrastRef.run(action.tokenKey, action.tokenType, action.value);
        break;
      case TemplateActionType.TemplateMappingSemanticTokenAddVariantButtonOnClick:
        await this.addSemanticVariant.run(action.semanticType, action.defaultGroupRef);
        break;
      case TemplateActionType.TemplateMappingSemanticTokenModifierListOnCommit:
        await this.updateSemanticVariantKey.run({
          variant: 'modifier',
          tokenKey: action.tokenKey,
          modifiers: action.modifiers,
        });
        break;
      case TemplateActionType.TemplateMappingSemanticTokenLanguageListOnCommit:
        await this.updateSemanticVariantKey.run({
          variant: 'language',
          tokenKey: action.tokenKey,
          language: action.value,
        });
        break;
      case TemplateActionType.TemplateMappingSemanticTokenVariantRemoveButtonOnClick:
        await this.removeMapping.run(action.tokenKey, action.tokenType);
        break;
      case TemplateActionType.TemplateGroupAddTextOnChange:
        await this.setTemplateAddGroupName.run(action.value);
        break;
      case TemplateActionType.TemplateGroupAddButtonOnClick:
        await this.addGroupAndClearInput.run();
        break;
      case TemplateActionType.TemplateGroupRemoveButtonOnClick:
        await this.removeGroup.run(action.groupId);
        break;
      case TemplateActionType.TemplateVariablesSearchTextOnChange:
        await this.setVariablesSearchText.run(action.value);
        break;
      case TemplateActionType.TemplateVariablesAddVariableNameTextOnChange:
        await this.setTemplateAddVariableName.run(action.value);
        break;
      case TemplateActionType.TemplateVariablesAddVariableButtonOnClick:
        await this.addVariable.run(action.groupRef, action.variableKind);
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
