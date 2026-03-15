import * as templateController from '../../domain/controllers/template-controller';
import type { ActionHandler, HandlerDeps, TemplateAction } from './handler-types';

export const handleTemplateAction: ActionHandler<TemplateAction> = async (
  action: TemplateAction,
  { setState, getState, setStoreState }: HandlerDeps,
): Promise<void> => {
  switch (action.type) {
    case 'TEMPLATE_PAGE_ON_LOAD':
      await templateController.loadTemplatePage(setState, setStoreState);
      break;
    case 'TEMPLATE_TEMPLATES_LIST_ON_COMMIT':
      await templateController.selectTemplateAndLoad(setState, action.name, action.version);
      break;
    case 'TEMPLATE_TEMPLATES_CREATE_BUTTON_ON_CLICK':
      templateController.openCreateDialog(setState);
      break;
    case 'TEMPLATE_CREATE_DIALOG_ON_OPEN':
      templateController.openCreateDialog(setState);
      break;
    case 'TEMPLATE_CREATE_DIALOG_NAME_TEXT_ON_CHANGE':
      templateController.setCreateFormName(setState, action.value);
      break;
    case 'TEMPLATE_CREATE_DIALOG_CANCEL_BUTTON_ON_CLICK':
      templateController.closeCreateDialog(setState);
      break;
    case 'TEMPLATE_CREATE_DIALOG_OK_BUTTON_ON_CLICK':
      await templateController.createTemplate(setState, setStoreState, action.params);
      break;
    case 'TEMPLATE_DETAILS_DELETE_VERSION_BUTTON_ON_CLICK':
      await templateController.deleteTemplateVersion(setState, setStoreState, action.name, action.version);
      break;
    case 'TEMPLATE_DETAILS_LOCK_BUTTON_ON_CLICK':
      await templateController.lockTemplate(setState, setStoreState, getState);
      break;
    case 'TEMPLATE_DETAILS_UPDATE_ALL_BUTTON_ON_CLICK':
      await templateController.updateAllCatalogs(setState, setStoreState, getState);
      break;
    case 'TEMPLATE_DETAILS_CATALOG_CHECKBOX_ON_TOGGLE':
      await templateController.toggleCatalog(
        setState,
        setStoreState,
        getState,
        action.catalogName,
        action.checked ?? true,
      );
      break;
    case 'TEMPLATE_DETAILS_CATALOG_VERSION_LIST_ON_COMMIT':
      await templateController.changeCatalogVersion(
        setState,
        setStoreState,
        getState,
        action.catalogName,
        action.value,
      );
      break;
    case 'TEMPLATE_DETAILS_SAVE_TEMPLATE':
      await templateController.saveTemplate(setState, setStoreState, action.template);
      break;
    case 'TEMPLATE_MAPPING_SEARCH_TEXT_ON_CHANGE':
      templateController.setMappingSearchText(setState, action.value);
      break;
    case 'TEMPLATE_MAPPING_COLOR_VARIABLE_FILTER_LIST_ON_SELECT':
      templateController.setMappingColorVariableFilter(setState, action.values);
      break;
    case 'TEMPLATE_MAPPING_CONTRAST_VARIABLE_FILTER_LIST_ON_SELECT':
      templateController.setMappingContrastVariableFilter(setState, action.values);
      break;
    case 'TEMPLATE_MAPPING_TOKEN_GROUP_LIST_ON_COMMIT':
      if (action.tokenKey != null && action.tokenType != null) {
        await templateController.setMappingGroupRef(
          setState,
          setStoreState,
          getState,
          action.tokenKey,
          action.tokenType,
          action.value || null,
        );
      } else {
        templateController.setMappingTokenGroupSelection(setState, action.value);
      }
      // Update UI state so the mapping editor shows the selected group's tokens.
      break;
    case 'TEMPLATE_MAPPING_TOKEN_COLOR_VARIABLE_LIST_ON_COMMIT':
      if (action.tokenKey != null && action.tokenType != null) {
        await templateController.setMappingColorRef(
          setState,
          setStoreState,
          getState,
          action.tokenKey,
          action.tokenType,
          action.value,
          action.isOrphan,
        );
      }
      break;
    case 'TEMPLATE_MAPPING_TOKEN_CONTRAST_VARIABLE_LIST_ON_COMMIT':
      if (action.tokenKey != null && action.tokenType != null) {
        await templateController.setMappingContrastRef(
          setState,
          setStoreState,
          getState,
          action.tokenKey,
          action.tokenType,
          action.value,
        );
      }
      break;
    case 'TEMPLATE_MAPPING_SEMANTIC_TOKEN_ADD_VARIANT_BUTTON_ON_CLICK': {
      const semanticType = action.tokenKey ?? action.semanticType ?? '';
      const modifiers = action.modifiers ?? [];
      const language = action.language ?? null;
      if (semanticType) {
        await templateController.addSemanticVariant(
          setState,
          setStoreState,
          getState,
          semanticType,
          modifiers,
          language,
          action.defaultGroupRef,
        );
      }
      break;
    }
    case 'TEMPLATE_MAPPING_SEMANTIC_TOKEN_MODIFIER_LIST_ON_COMMIT':
      if (action.tokenKey != null && (action.modifiers != null || action.value !== undefined)) {
        await templateController.updateSemanticVariantKey(
          setState,
          setStoreState,
          getState,
          action.tokenKey,
          action.modifiers ?? (action.value ? [action.value] : []),
          action.language ?? null,
        );
      }
      break;
    case 'TEMPLATE_MAPPING_SEMANTIC_TOKEN_LANGUAGE_LIST_ON_COMMIT':
      if (action.tokenKey != null) {
        await templateController.updateSemanticVariantKey(
          setState,
          setStoreState,
          getState,
          action.tokenKey,
          action.modifiers ?? [],
          action.value ?? null,
        );
      }
      break;
    case 'TEMPLATE_MAPPING_SEMANTIC_TOKEN_VARIANT_REMOVE_BUTTON_ON_CLICK':
      if (action.tokenKey != null || action.variantId != null) {
        await templateController.removeMapping(
          setState,
          setStoreState,
          getState,
          action.tokenKey ?? action.variantId ?? '',
          action.tokenType ?? 'semantic token',
        );
      }
      break;
    case 'TEMPLATE_GROUP_ADD_TEXT_ON_CHANGE':
      // No-op: UI keeps local state; name passed on ADD_BUTTON.
      break;
    case 'TEMPLATE_GROUP_ADD_BUTTON_ON_CLICK':
      if (action.name != null && action.name.trim()) {
        await templateController.addGroup(setState, setStoreState, getState, action.name.trim());
      }
      break;
    case 'TEMPLATE_GROUP_REMOVE_BUTTON_ON_CLICK':
      if (action.groupId != null) {
        await templateController.removeGroup(setState, setStoreState, getState, action.groupId);
      }
      break;
    case 'TEMPLATE_VARIABLES_SEARCH_TEXT_ON_CHANGE':
      templateController.setVariablesSearchText(setState, action.value);
      break;
    case 'TEMPLATE_VARIABLES_ADD_VARIABLE_NAME_TEXT_ON_CHANGE':
      // No-op: UI keeps local state; key/groupRef passed on ADD_BUTTON.
      break;
    case 'TEMPLATE_VARIABLES_ADD_VARIABLE_BUTTON_ON_CLICK':
      if (action.key != null && action.key.trim()) {
        if (action.variableKind === 'contrast') {
          await templateController.addContrastVariable(
            setState,
            setStoreState,
            getState,
            action.key.trim(),
            action.groupRef ?? null,
          );
        } else {
          await templateController.addColorVariable(
            setState,
            setStoreState,
            getState,
            action.key.trim(),
            action.groupRef ?? null,
          );
        }
      }
      break;
    case 'TEMPLATE_VARIABLES_GROUP_LIST_ON_COMMIT':
      if (action.variableKey != null) {
        await templateController.updateVariableGroupRef(
          setState,
          setStoreState,
          getState,
          action.variableKey,
          action.value || null,
        );
      }
      break;
    case 'TEMPLATE_VARIABLES_REMOVE_BUTTON_ON_CLICK':
      if (action.key != null) {
        const t = getState().templates.template;
        if (t?.colorVariables.some((v) => v.key === action.key)) {
          await templateController.removeColorVariable(setState, setStoreState, getState, action.key);
        } else {
          await templateController.removeContrastVariable(setState, setStoreState, getState, action.key);
        }
      }
      break;
    case 'TEMPLATE_VARIABLES_CONTRAST_SOURCE_LIST_ON_COMMIT':
      if (action.contrastVariableKey != null) {
        await templateController.updateContrastComparisonSource(
          setState,
          setStoreState,
          getState,
          action.contrastVariableKey,
          action.value,
        );
      }
      break;
  }
};
