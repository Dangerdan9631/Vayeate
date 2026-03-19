export {
  createTemplateWithParams,
  type CreateTemplateParams,
} from './template-list/createTemplateWithParams';

// template-list
export { templateStackId } from './template-list/templateStackId';
export { loadTemplateRefs } from './template-list/loadTemplateRefs';
export { loadTemplatePage } from './template-list/loadTemplatePage';
export { selectTemplateAndLoad } from './template-list/selectTemplateAndLoad';
export { openCreateDialog } from './template-list/openCreateDialog';
export { setCreateFormName } from './template-list/setCreateFormName';
export { closeCreateDialog } from './template-list/closeCreateDialog';
export { createTemplate } from './template-list/createTemplate';
export { deleteTemplateVersion } from './template-list/deleteTemplateVersion';

// template-details
export { openTemplateCreateDialog } from './template-details/openTemplateCreateDialog';
export { closeTemplateCreateDialog } from './template-details/closeTemplateCreateDialog';
export { saveTemplate } from './template-details/saveTemplate';
export { restoreTemplateState } from './template-details/restoreTemplateState';
export { lockTemplate } from './template-details/lockTemplate';
export { updateAllCatalogs } from './template-details/updateAllCatalogs';
export { toggleCatalog } from './template-details/toggleCatalog';
export { changeCatalogVersion } from './template-details/changeCatalogVersion';

// mappings
export { setMappingSearchText } from './mappings/setMappingSearchText';
export { setMappingColorVariableFilter } from './mappings/setMappingColorVariableFilter';
export { setMappingContrastVariableFilter } from './mappings/setMappingContrastVariableFilter';
export { setMappingTokenGroupSelection } from './mappings/setMappingTokenGroupSelection';
export { setMappingColorRef } from './mappings/setMappingColorRef';
export { setMappingContrastRef } from './mappings/setMappingContrastRef';
export { setMappingGroupRef } from './mappings/setMappingGroupRef';
export { removeMapping } from './mappings/removeMapping';

// mappings-semantic
export { addSemanticVariant } from './mappings-semantic/addSemanticVariant';
export { updateSemanticVariantKey } from './mappings-semantic/updateSemanticVariantKey';

// groups
export { addGroup } from './groups/addGroup';
export { addGroupAndClearInput } from './groups/addGroupAndClearInput';
export { removeGroup } from './groups/removeGroup';
export { setTemplateAddGroupName } from './groups/setTemplateAddGroupName';

// variables
export { addVariable } from './variables/addVariable';
export { removeVariable } from './variables/removeVariable';
export { setVariablesSearchText } from './variables/setVariablesSearchText';
export { setTemplateAddVariableName } from './variables/setTemplateAddVariableName';
export { updateVariableGroupRef } from './variables/updateVariableGroupRef';

// variables-color
export { addColorVariable } from './variables-color/addColorVariable';
export { removeColorVariable } from './variables-color/removeColorVariable';

// variables-contrast
export { addContrastVariable } from './variables-contrast/addContrastVariable';
export { removeContrastVariable } from './variables-contrast/removeContrastVariable';
export { updateContrastComparisonSource } from './variables-contrast/updateContrastComparisonSource';
