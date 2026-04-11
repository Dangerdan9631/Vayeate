// template-list
export { LoadTemplateRefsOperation } from './template-list/load-template-refs-operation';
export { SetTemplateRefsOperation } from './template-list/set-template-refs-operation';
export { SetSelectedTemplateRefOperation } from './template-list/set-selected-template-ref-operation';
export { SetTemplateCreateFormNameOperation } from './template-list/set-template-create-form-name-operation';
export { CreateTemplateOperation } from './template-list/create-template-operation';
export { SetTemplateCreateDialogOpenOperation } from './template-list/set-template-create-dialog-open-operation';
export { SetTemplateIsCreatingOperation } from './template-list/set-template-is-creating-operation';
export { RefreshTemplateRefsOperation } from './template-list/refresh-template-refs-operation';
export { RefreshTemplateRefsAndSelectOperation } from './template-list/refresh-template-refs-and-select-operation';
export { DeleteTemplateOperation } from './template-list/delete-template-operation';

// template-details
export { SetTemplateOperation } from './template-details/set-template-operation';
export { LoadTemplateOperation } from './template-details/load-template-operation';
export { LoadTemplateSnapshotOperation } from './template-details/load-template-snapshot-operation';
export { SaveTemplateOperation } from './template-details/save-template-operation';
export { BumpTemplateVersionForEditOperation } from './template-details/bump-template-version-for-edit-operation';
export { LockTemplateOperation } from './template-details/lock-template-operation';

// mappings
export { SetTemplateMappingSearchTextOperation } from './mappings/set-template-mapping-search-text-operation';
export { SetTemplateMappingColorVariableFilterOperation } from './mappings/set-template-mapping-color-variable-filter-operation';
export { SetTemplateMappingContrastVariableFilterOperation } from './mappings/set-template-mapping-contrast-variable-filter-operation';
export { SetTemplateMappingTokenGroupSelectionOperation } from './mappings/set-template-mapping-token-group-selection-operation';
export { RemoveMappingFromTemplateOperation } from './mappings/remove-mapping-from-template-operation';
export { SetMappingColorRefOperation } from './mappings/set-mapping-color-ref-operation';
export { SetMappingContrastRefOperation } from './mappings/set-mapping-contrast-ref-operation';
export { SetMappingGroupRefOperation } from './mappings/set-mapping-group-ref-operation';

// template groups (entity transforms)
export { AddGroupToTemplateOperation } from './groups/add-group-to-template-operation';
export { RemoveGroupFromTemplateOperation } from './groups/remove-group-from-template-operation';

// variables
export { SetTemplateVariablesSearchTextOperation } from './variables/set-template-variables-search-text-operation';
export { SetTemplateAddGroupNameOperation } from './variables/set-template-add-group-name-operation';
export { SetTemplateAddVariableNameOperation } from './variables/set-template-add-variable-name-operation';
export { UpdateVariableGroupRefOperation } from './variables/update-variable-group-ref-operation';

export { AddColorVariableOperation } from './variables-color/add-color-variable-operation';
export { RemoveColorVariableOperation } from './variables-color/remove-color-variable-operation';
export { AddContrastVariableOperation } from './variables-contrast/add-contrast-variable-operation';
export { RemoveContrastVariableOperation } from './variables-contrast/remove-contrast-variable-operation';
export { UpdateContrastComparisonSourceOperation } from './variables-contrast/update-contrast-comparison-source-operation';

export { GenerateSemanticVariantKeyOperation } from './mappings-semantic/generate-semantic-variant-key-operation';
export { MergeSemanticTokenSetsOperation } from './mappings-semantic/merge-semantic-token-sets-operation';
export { AppendSemanticVariantToTemplateOperation } from './mappings-semantic/append-semantic-variant-to-template-operation';
export { UpdateSemanticVariantKeyInTemplateOperation } from './mappings-semantic/update-semantic-variant-key-in-template-operation';
