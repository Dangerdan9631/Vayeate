export type { SetState } from './types';

// template-list
export { setTemplateRefs } from './template-list/setTemplateRefs';
export { setSelectedTemplateRef } from './template-list/setSelectedTemplateRef';
export { setTemplateCreateFormName } from './template-list/setTemplateCreateFormName';
export { LoadTemplateRefs } from './template-list/loadTemplateRefs';
export { createTemplate } from './template-list/createTemplate';
export { refreshTemplateRefs } from './template-list/refreshTemplateRefs';
export { deleteTemplate } from './template-list/deleteTemplate';

// template-details
export { setTemplate } from './template-details/setTemplate';
export { loadTemplate } from './template-details/loadTemplate';
export { loadTemplateSnapshot } from './template-details/loadTemplateSnapshot';
export { saveTemplate } from './template-details/saveTemplate';
export { bumpTemplateVersionForEdit } from './template-details/bump-template-version-for-edit';
export { lockTemplateEntity } from './template-details/lock-template';

// mappings
export { setTemplateMappingSearchText } from './mappings/setTemplateMappingSearchText';
export { setTemplateMappingColorVariableFilter } from './mappings/setTemplateMappingColorVariableFilter';
export { setTemplateMappingContrastVariableFilter } from './mappings/setTemplateMappingContrastVariableFilter';
export { setTemplateMappingTokenGroupSelection } from './mappings/setTemplateMappingTokenGroupSelection';
export { removeMappingFromTemplate } from './mappings/remove-mapping-from-template';
export { applyMappingColorRef } from './mappings/set-mapping-color-ref';
export { applyMappingContrastRef } from './mappings/set-mapping-contrast-ref';
export { applyMappingGroupRef } from './mappings/set-mapping-group-ref';

// template groups (entity transforms)
export { addGroupToTemplate } from './groups/add-group-to-template';
export { removeGroupFromTemplate } from './groups/remove-group-from-template';

// variables
export { setTemplateVariablesSearchText } from './variables/setTemplateVariablesSearchText';
export { setTemplateAddGroupName } from './variables/setTemplateAddGroupName';
export { setTemplateAddVariableName } from './variables/setTemplateAddVariableName';
export { updateVariableGroupRef as applyVariableGroupRefUpdate } from './variables/update-variable-group-ref';

export { addColorVariableToTemplate } from './variables-color/add-color-variable';
export { removeColorVariableFromTemplate } from './variables-color/remove-color-variable';
export { addContrastVariableToTemplate } from './variables-contrast/add-contrast-variable';
export { removeContrastVariableFromTemplate } from './variables-contrast/remove-contrast-variable';
export { applyContrastComparisonSourceUpdate } from './variables-contrast/update-contrast-comparison-source';

export { generateSemanticVariantKey } from './mappings-semantic/generate-semantic-variant-key';
export { mergeSemanticTokenSets } from './mappings-semantic/merge-semantic-token-sets';
export { appendSemanticVariantToTemplate } from './mappings-semantic/append-semantic-variant-to-template';
export { updateSemanticVariantKeyInTemplate } from './mappings-semantic/update-semantic-variant-key-in-template';
