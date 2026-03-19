import * as templateController from '../../domain/controllers/template-controller';
import type { ActionHandler, HandlerDeps, TemplateAction } from './handler-types';
import { TemplateActionType } from '../actions/action-types';

export const handleTemplateAction: ActionHandler<TemplateAction> = async (
  action: TemplateAction,
  { setState, getState, setStoreState }: HandlerDeps,
): Promise<void> => {
  switch (action.type) {
    case TemplateActionType.TemplatePageOnLoad:
      await templateController.loadTemplatePage(setState, setStoreState);
      break;
    case TemplateActionType.TemplateTemplatesListOnCommit:
      await templateController.selectTemplateAndLoad(setState, action.name, action.version);
      break;
    case TemplateActionType.TemplateTemplatesCreateButtonOnClick:
      templateController.openCreateDialog(setState);
      break;
    case TemplateActionType.TemplateCreateDialogOnOpen:
      templateController.openCreateDialog(setState);
      break;
    case TemplateActionType.TemplateCreateDialogNameTextOnChange:
      templateController.setCreateFormName(setState, action.value);
      break;
    case TemplateActionType.TemplateCreateDialogCancelButtonOnClick:
      templateController.closeCreateDialog(setState);
      break;
    case TemplateActionType.TemplateCreateDialogOkButtonOnClick:
      await templateController.createTemplate(setState, setStoreState, action.params);
      break;
    case TemplateActionType.TemplateDetailsDeleteVersionButtonOnClick:
      await templateController.deleteTemplateVersion(setState, setStoreState, action.name, action.version);
      break;
    case TemplateActionType.TemplateDetailsLockButtonOnClick:
      await templateController.lockTemplate(setState, setStoreState, getState);
      break;
    case TemplateActionType.TemplateDetailsUpdateAllButtonOnClick:
      await templateController.updateAllCatalogs(setState, setStoreState, getState);
      break;
    case TemplateActionType.TemplateDetailsCatalogCheckboxOnToggle:
      await templateController.toggleCatalog(
        setState,
        setStoreState,
        getState,
        action.catalogName,
        action.checked ?? true,
      );
      break;
    case TemplateActionType.TemplateDetailsCatalogVersionListOnCommit:
      await templateController.changeCatalogVersion(
        setState,
        setStoreState,
        getState,
        action.catalogName,
        action.value,
      );
      break;
    case TemplateActionType.TemplateDetailsSaveTemplate:
      await templateController.saveTemplate(setState, setStoreState, action.template);
      break;
    case TemplateActionType.TemplateMappingSearchTextOnChange:
      templateController.setMappingSearchText(setState, action.value);
      break;
    case TemplateActionType.TemplateMappingColorVariableFilterListOnSelect:
      templateController.setMappingColorVariableFilter(setState, action.values);
      break;
    case TemplateActionType.TemplateMappingContrastVariableFilterListOnSelect:
      templateController.setMappingContrastVariableFilter(setState, action.values);
      break;
    case TemplateActionType.TemplateMappingExistingTokenGroupListOnCommit:
      await templateController.setMappingGroupRef(
        setState,
        setStoreState,
        getState,
        action.tokenKey,
        action.tokenType,
        action.value || null,
      );
      break;
    case TemplateActionType.TemplateMappingTokenGroupSelectionOnCommit:
      templateController.setMappingTokenGroupSelection(setState, action.value);
      break;
    case TemplateActionType.TemplateMappingExistingTokenColorVariableListOnCommit:
      await templateController.setMappingColorRef(
        setState,
        setStoreState,
        getState,
        action.tokenKey,
        action.tokenType,
        action.value,
        action.isOrphan,
      );
      break;
    case TemplateActionType.TemplateMappingExistingTokenContrastVariableListOnCommit:
      await templateController.setMappingContrastRef(
        setState,
        setStoreState,
        getState,
        action.tokenKey,
        action.tokenType,
        action.value,
      );
      break;
    case TemplateActionType.TemplateMappingSemanticTokenAddVariantButtonOnClick:
      await templateController.addSemanticVariant(
        setState,
        setStoreState,
        getState,
        action.semanticType,
        action.modifiers,
        action.language,
        action.defaultGroupRef,
      );
      break;
    case TemplateActionType.TemplateMappingSemanticTokenModifierListOnCommit:
      await templateController.updateSemanticVariantKey(
        setState,
        setStoreState,
        getState,
        action.tokenKey,
        action.modifiers,
        action.language,
      );
      break;
    case TemplateActionType.TemplateMappingSemanticTokenLanguageListOnCommit:
      await templateController.updateSemanticVariantKey(
        setState,
        setStoreState,
        getState,
        action.tokenKey,
        action.modifiers,
        action.value ?? null,
      );
      break;
    case TemplateActionType.TemplateMappingSemanticTokenVariantRemoveButtonOnClick:
      await templateController.removeMapping(
        setState,
        setStoreState,
        getState,
        action.tokenKey,
        action.tokenType,
      );
      break;
    case TemplateActionType.TemplateGroupAddTextOnChange:
      templateController.setTemplateAddGroupName(setState, action.value);
      break;
    case TemplateActionType.TemplateGroupAddButtonOnClick:
      await templateController.addGroupAndClearInput(setState, setStoreState, getState, action.name);
      break;
    case TemplateActionType.TemplateGroupRemoveButtonOnClick:
      await templateController.removeGroup(setState, setStoreState, getState, action.groupId);
      break;
    case TemplateActionType.TemplateVariablesSearchTextOnChange:
      templateController.setVariablesSearchText(setState, action.value);
      break;
    case TemplateActionType.TemplateVariablesAddVariableNameTextOnChange:
      templateController.setTemplateAddVariableName(setState, action.value);
      break;
    case TemplateActionType.TemplateVariablesAddVariableButtonOnClick:
      await templateController.addVariable(
        setState,
        setStoreState,
        getState,
        action.key,
        action.groupRef,
        action.variableKind,
      );
      break;
    case TemplateActionType.TemplateVariablesGroupListOnCommit:
      await templateController.updateVariableGroupRef(
        setState,
        setStoreState,
        getState,
        action.variableKey,
        action.value || null,
      );
      break;
    case TemplateActionType.TemplateVariablesRemoveButtonOnClick:
      await templateController.removeVariable(setState, setStoreState, getState, action.key);
      break;
    case TemplateActionType.TemplateVariablesContrastSourceListOnCommit:
      await templateController.updateContrastComparisonSource(
        setState,
        setStoreState,
        getState,
        action.contrastVariableKey,
        action.value,
      );
      break;
  }
};
