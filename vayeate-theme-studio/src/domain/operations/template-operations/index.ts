export type { SetState } from './types';

// template-list
export { setTemplateRefs } from './template-list/setTemplateRefs';
export { setSelectedTemplateRef } from './template-list/setSelectedTemplateRef';
export { setTemplateCreateFormName } from './template-list/setTemplateCreateFormName';
export { loadTemplateRefs } from './template-list/loadTemplateRefs';
export { createTemplate } from './template-list/createTemplate';
export { refreshTemplateRefs } from './template-list/refreshTemplateRefs';
export { deleteTemplate } from './template-list/deleteTemplate';

// template-details
export { setTemplate } from './template-details/setTemplate';
export { loadTemplate } from './template-details/loadTemplate';
export { loadTemplateSnapshot } from './template-details/loadTemplateSnapshot';
export { saveTemplate } from './template-details/saveTemplate';

// mappings
export { setTemplateMappingSearchText } from './mappings/setTemplateMappingSearchText';
export { setTemplateMappingColorVariableFilter } from './mappings/setTemplateMappingColorVariableFilter';
export { setTemplateMappingContrastVariableFilter } from './mappings/setTemplateMappingContrastVariableFilter';
export { setTemplateMappingTokenGroupSelection } from './mappings/setTemplateMappingTokenGroupSelection';

// variables
export { setTemplateVariablesSearchText } from './variables/setTemplateVariablesSearchText';
export { setTemplateAddGroupName } from './variables/setTemplateAddGroupName';
export { setTemplateAddVariableName } from './variables/setTemplateAddVariableName';
