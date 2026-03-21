import * as templateController from '../../domain/controllers/template-controller';
import type { ActionHandler, HandlerDeps, TemplateAction } from './handler-types';
import { TemplateActionType } from '../actions/action-types';
import { container } from 'tsyringe';

export const handleTemplateAction: ActionHandler<TemplateAction> = async (
  action: TemplateAction,
  _deps: HandlerDeps,
): Promise<void> => {
  switch (action.type) {
    case TemplateActionType.TemplatePageOnLoad:
      await container.resolve(templateController.LoadTemplatePageController).run();
      break;
    case TemplateActionType.TemplateTemplatesListOnCommit:
      await container
        .resolve(templateController.SelectTemplateAndLoadController)
        .run(action.name, action.version);
      break;
    case TemplateActionType.TemplateTemplatesCreateButtonOnClick:
      container.resolve(templateController.OpenCreateDialogController).run();
      break;
    case TemplateActionType.TemplateCreateDialogOnOpen:
      container.resolve(templateController.OpenCreateDialogController).run();
      break;
    case TemplateActionType.TemplateCreateDialogNameTextOnChange:
      container.resolve(templateController.SetCreateFormNameController).run(action.value);
      break;
    case TemplateActionType.TemplateCreateDialogCancelButtonOnClick:
      container.resolve(templateController.CloseCreateDialogController).run();
      break;
    case TemplateActionType.TemplateCreateDialogOkButtonOnClick:
      await container.resolve(templateController.CreateTemplateController).run(action.params);
      break;
    case TemplateActionType.TemplateDetailsDeleteVersionButtonOnClick:
      await container
        .resolve(templateController.DeleteTemplateVersionController)
        .run(action.name, action.version);
      break;
    case TemplateActionType.TemplateDetailsLockButtonOnClick:
      await container.resolve(templateController.LockTemplateController).run();
      break;
    case TemplateActionType.TemplateDetailsUpdateAllButtonOnClick:
      await container.resolve(templateController.UpdateAllCatalogsController).run();
      break;
    case TemplateActionType.TemplateDetailsCatalogCheckboxOnToggle:
      await container
        .resolve(templateController.ToggleCatalogController)
        .run(action.catalogName, action.checked ?? true);
      break;
    case TemplateActionType.TemplateDetailsCatalogVersionListOnCommit:
      await container
        .resolve(templateController.ChangeCatalogVersionController)
        .run(action.catalogName, action.value);
      break;
    case TemplateActionType.TemplateDetailsSaveTemplate:
      await container.resolve(templateController.SaveTemplateController).run(action.template);
      break;
    case TemplateActionType.TemplateMappingSearchTextOnChange:
      container.resolve(templateController.SetMappingSearchTextController).run(action.value);
      break;
    case TemplateActionType.TemplateMappingColorVariableFilterListOnSelect:
      container
        .resolve(templateController.SetMappingColorVariableFilterController)
        .run(action.values);
      break;
    case TemplateActionType.TemplateMappingContrastVariableFilterListOnSelect:
      container
        .resolve(templateController.SetMappingContrastVariableFilterController)
        .run(action.values);
      break;
    case TemplateActionType.TemplateMappingExistingTokenGroupListOnCommit:
      await container
        .resolve(templateController.SetMappingGroupRefController)
        .run(action.tokenKey, action.tokenType, action.value || null);
      break;
    case TemplateActionType.TemplateMappingTokenGroupSelectionOnCommit:
      container
        .resolve(templateController.SetMappingTokenGroupSelectionController)
        .run(action.value);
      break;
    case TemplateActionType.TemplateMappingExistingTokenColorVariableListOnCommit:
      await container
        .resolve(templateController.SetMappingColorRefController)
        .run(action.tokenKey, action.tokenType, action.value, action.isOrphan);
      break;
    case TemplateActionType.TemplateMappingExistingTokenContrastVariableListOnCommit:
      await container
        .resolve(templateController.SetMappingContrastRefController)
        .run(action.tokenKey, action.tokenType, action.value);
      break;
    case TemplateActionType.TemplateMappingSemanticTokenAddVariantButtonOnClick:
      await container
        .resolve(templateController.AddSemanticVariantController)
        .run(action.semanticType, action.modifiers, action.language, action.defaultGroupRef);
      break;
    case TemplateActionType.TemplateMappingSemanticTokenModifierListOnCommit:
      await container
        .resolve(templateController.UpdateSemanticVariantKeyController)
        .run(action.tokenKey, action.modifiers, action.language);
      break;
    case TemplateActionType.TemplateMappingSemanticTokenLanguageListOnCommit:
      await container
        .resolve(templateController.UpdateSemanticVariantKeyController)
        .run(action.tokenKey, action.modifiers, action.value ?? null);
      break;
    case TemplateActionType.TemplateMappingSemanticTokenVariantRemoveButtonOnClick:
      await container
        .resolve(templateController.RemoveMappingController)
        .run(action.tokenKey, action.tokenType);
      break;
    case TemplateActionType.TemplateGroupAddTextOnChange:
      container.resolve(templateController.SetTemplateAddGroupNameController).run(action.value);
      break;
    case TemplateActionType.TemplateGroupAddButtonOnClick:
      await container
        .resolve(templateController.AddGroupAndClearInputController)
        .run(action.name);
      break;
    case TemplateActionType.TemplateGroupRemoveButtonOnClick:
      await container.resolve(templateController.RemoveGroupController).run(action.groupId);
      break;
    case TemplateActionType.TemplateVariablesSearchTextOnChange:
      container.resolve(templateController.SetVariablesSearchTextController).run(action.value);
      break;
    case TemplateActionType.TemplateVariablesAddVariableNameTextOnChange:
      container
        .resolve(templateController.SetTemplateAddVariableNameController)
        .run(action.value);
      break;
    case TemplateActionType.TemplateVariablesAddVariableButtonOnClick:
      await container
        .resolve(templateController.AddVariableController)
        .run(action.key, action.groupRef, action.variableKind);
      break;
    case TemplateActionType.TemplateVariablesGroupListOnCommit:
      await container
        .resolve(templateController.UpdateVariableGroupRefController)
        .run(action.variableKey, action.value || null);
      break;
    case TemplateActionType.TemplateVariablesRemoveButtonOnClick:
      await container.resolve(templateController.RemoveVariableController).run(action.key);
      break;
    case TemplateActionType.TemplateVariablesContrastSourceListOnCommit:
      await container
        .resolve(templateController.UpdateContrastComparisonSourceController)
        .run(action.contrastVariableKey, action.value);
      break;
  }
};
