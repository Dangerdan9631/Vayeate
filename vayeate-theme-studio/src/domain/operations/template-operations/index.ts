import { AppStateSetter } from '../../state/app-state-setter';
import { StoreStateSetter } from '../../state/store-state-setter';

// template-list
export { LoadTemplateRefs } from './template-list/loadTemplateRefs';
export { SetTemplateRefs } from './template-list/setTemplateRefs';
export { SetSelectedTemplateRef } from './template-list/setSelectedTemplateRef';
export { SetTemplateCreateFormName } from './template-list/setTemplateCreateFormName';
export { CreateTemplate } from './template-list/createTemplate';
export { RefreshTemplateRefs } from './template-list/refreshTemplateRefs';
export { DeleteTemplate } from './template-list/deleteTemplate';

// template-details
export { SetTemplate } from './template-details/setTemplate';
export { LoadTemplate } from './template-details/loadTemplate';
export { LoadTemplateSnapshot } from './template-details/loadTemplateSnapshot';
export { SaveTemplate } from './template-details/saveTemplate';
export { BumpTemplateVersionForEdit } from './template-details/bump-template-version-for-edit';
export { LockTemplate } from './template-details/lock-template';

// mappings
export { SetTemplateMappingSearchText } from './mappings/setTemplateMappingSearchText';
export { SetTemplateMappingColorVariableFilter } from './mappings/setTemplateMappingColorVariableFilter';
export { SetTemplateMappingContrastVariableFilter } from './mappings/setTemplateMappingContrastVariableFilter';
export { SetTemplateMappingTokenGroupSelection } from './mappings/setTemplateMappingTokenGroupSelection';
export { RemoveMappingFromTemplate } from './mappings/remove-mapping-from-template';
export { SetMappingColorRef } from './mappings/set-mapping-color-ref';
export { SetMappingContrastRef } from './mappings/set-mapping-contrast-ref';
export { SetMappingGroupRef } from './mappings/set-mapping-group-ref';

// template groups (entity transforms)
export { AddGroupToTemplate } from './groups/add-group-to-template';
export { RemoveGroupFromTemplate } from './groups/remove-group-from-template';

// variables
export { SetTemplateVariablesSearchText } from './variables/setTemplateVariablesSearchText';
export { SetTemplateAddGroupName } from './variables/setTemplateAddGroupName';
export { SetTemplateAddVariableName } from './variables/setTemplateAddVariableName';
export { UpdateVariableGroupRef } from './variables/update-variable-group-ref';

export { AddColorVariable } from './variables-color/add-color-variable';
export { RemoveColorVariable } from './variables-color/remove-color-variable';
export { AddContrastVariable } from './variables-contrast/add-contrast-variable';
export { RemoveContrastVariable } from './variables-contrast/remove-contrast-variable';
export { UpdateContrastComparisonSource } from './variables-contrast/update-contrast-comparison-source';

export { GenerateSemanticVariantKey } from './mappings-semantic/generate-semantic-variant-key';
export { MergeSemanticTokenSets } from './mappings-semantic/merge-semantic-token-sets';
export { AppendSemanticVariantToTemplate } from './mappings-semantic/append-semantic-variant-to-template';
export { UpdateSemanticVariantKeyInTemplate } from './mappings-semantic/update-semantic-variant-key-in-template';

import { CreateTemplate as CreateTemplateClass } from './template-list/createTemplate';
import { DeleteTemplate as DeleteTemplateClass } from './template-list/deleteTemplate';
import { LoadTemplate as LoadTemplateClass } from './template-details/loadTemplate';
import { LoadTemplateSnapshot as LoadTemplateSnapshotClass } from './template-details/loadTemplateSnapshot';
import { RefreshTemplateRefs as RefreshTemplateRefsClass } from './template-list/refreshTemplateRefs';
import { SaveTemplate as SaveTemplateClass } from './template-details/saveTemplate';
import { SetSelectedTemplateRef as SetSelectedTemplateRefClass } from './template-list/setSelectedTemplateRef';
import { SetTemplate as SetTemplateClass } from './template-details/setTemplate';
import { SetTemplateCreateFormName as SetTemplateCreateFormNameClass } from './template-list/setTemplateCreateFormName';
import { SetTemplateAddGroupName as SetTemplateAddGroupNameClass } from './variables/setTemplateAddGroupName';
import { SetTemplateAddVariableName as SetTemplateAddVariableNameClass } from './variables/setTemplateAddVariableName';
import { SetTemplateVariablesSearchText as SetTemplateVariablesSearchTextClass } from './variables/setTemplateVariablesSearchText';
import { SetTemplateMappingSearchText as SetTemplateMappingSearchTextClass } from './mappings/setTemplateMappingSearchText';
import { SetTemplateMappingColorVariableFilter as SetTemplateMappingColorVariableFilterClass } from './mappings/setTemplateMappingColorVariableFilter';
import { SetTemplateMappingContrastVariableFilter as SetTemplateMappingContrastVariableFilterClass } from './mappings/setTemplateMappingContrastVariableFilter';
import { SetTemplateMappingTokenGroupSelection as SetTemplateMappingTokenGroupSelectionClass } from './mappings/setTemplateMappingTokenGroupSelection';
import { BumpTemplateVersionForEdit as BumpTemplateVersionForEditClass } from './template-details/bump-template-version-for-edit';
import { RemoveMappingFromTemplate as RemoveMappingFromTemplateClass } from './mappings/remove-mapping-from-template';
import { SetMappingColorRef as SetMappingColorRefClass } from './mappings/set-mapping-color-ref';
import { SetMappingContrastRef as SetMappingContrastRefClass } from './mappings/set-mapping-contrast-ref';
import { SetMappingGroupRef as SetMappingGroupRefClass } from './mappings/set-mapping-group-ref';
import { LockTemplate as LockTemplateClass } from './template-details/lock-template';
import { GenerateSemanticVariantKey as GenerateSemanticVariantKeyClass } from './mappings-semantic/generate-semantic-variant-key';
import { MergeSemanticTokenSets as MergeSemanticTokenSetsClass } from './mappings-semantic/merge-semantic-token-sets';
import { AppendSemanticVariantToTemplate as AppendSemanticVariantToTemplateClass } from './mappings-semantic/append-semantic-variant-to-template';
import { UpdateSemanticVariantKeyInTemplate as UpdateSemanticVariantKeyInTemplateClass } from './mappings-semantic/update-semantic-variant-key-in-template';
import { AddGroupToTemplate as AddGroupToTemplateClass } from './groups/add-group-to-template';
import { RemoveGroupFromTemplate as RemoveGroupFromTemplateClass } from './groups/remove-group-from-template';
import { UpdateVariableGroupRef as UpdateVariableGroupRefClass } from './variables/update-variable-group-ref';
import { AddColorVariable as AddColorVariableClass } from './variables-color/add-color-variable';
import { RemoveColorVariable as RemoveColorVariableClass } from './variables-color/remove-color-variable';
import { AddContrastVariable as AddContrastVariableClass } from './variables-contrast/add-contrast-variable';
import { RemoveContrastVariable as RemoveContrastVariableClass } from './variables-contrast/remove-contrast-variable';
import { UpdateContrastComparisonSource as UpdateContrastComparisonSourceClass } from './variables-contrast/update-contrast-comparison-source';

/** @deprecated Backward compatibility — use injected AppStateSetter instead */
export type SetState = (update: import('../../state/app-state').AppStateUpdate) => void;

/** @deprecated Backward-compatible function wrappers for controller migration */
export const createTemplate = (_setState: SetState, params: { name: string }) =>
  new CreateTemplateClass().execute(params);

export const setTemplate = (_setState: SetState, template: import('../../../model/schemas').Template | null) =>
  new SetTemplateClass(new AppStateSetter(_setState)).execute(template);

export const setSelectedTemplateRef = (
  _setState: SetState,
  ref: import('../../../model/schemas').TemplateReference | null,
) => new SetSelectedTemplateRefClass(new AppStateSetter(_setState)).execute(ref);

export const refreshTemplateRefs = (_setStoreState: import('../../state/store-state-reducer').SetStoreState) =>
  new RefreshTemplateRefsClass(new StoreStateSetter(_setStoreState)).execute();

export const loadTemplate = (_setState: SetState, name: string, version: string) =>
  new LoadTemplateClass(new AppStateSetter(_setState)).execute(name, version);

export const saveTemplate = (template: import('../../../model/schemas').Template) =>
  new SaveTemplateClass().execute(template);

export const deleteTemplate = (name: string, version: string) =>
  new DeleteTemplateClass().execute(name, version);

export const loadTemplateSnapshot = (name: string, version: string) =>
  new LoadTemplateSnapshotClass().execute(name, version);

export const setTemplateCreateFormName = (_setState: SetState, value: string) =>
  new SetTemplateCreateFormNameClass(new AppStateSetter(_setState)).execute(value);

export const setTemplateAddGroupName = (_setState: SetState, value: string) =>
  new SetTemplateAddGroupNameClass(new AppStateSetter(_setState)).execute(value);

export const setTemplateAddVariableName = (_setState: SetState, value: string) =>
  new SetTemplateAddVariableNameClass(new AppStateSetter(_setState)).execute(value);

export const setTemplateVariablesSearchText = (_setState: SetState, value: string) =>
  new SetTemplateVariablesSearchTextClass(new AppStateSetter(_setState)).execute(value);

export const setTemplateMappingSearchText = (_setState: SetState, value: string) =>
  new SetTemplateMappingSearchTextClass(new AppStateSetter(_setState)).execute(value);

export const setTemplateMappingColorVariableFilter = (_setState: SetState, values: string[]) =>
  new SetTemplateMappingColorVariableFilterClass(new AppStateSetter(_setState)).execute(values);

export const setTemplateMappingContrastVariableFilter = (_setState: SetState, values: string[]) =>
  new SetTemplateMappingContrastVariableFilterClass(new AppStateSetter(_setState)).execute(values);

export const setTemplateMappingTokenGroupSelection = (_setState: SetState, value: string) =>
  new SetTemplateMappingTokenGroupSelectionClass(new AppStateSetter(_setState)).execute(value);

export const bumpTemplateVersionForEdit = (template: import('../../../model/schemas').Template) =>
  new BumpTemplateVersionForEditClass().execute(template);

export const removeMappingFromTemplate = (
  template: import('../../../model/schemas').Template,
  tokenKey: string,
  tokenType: import('../../../model/schemas').TokenType,
) => new RemoveMappingFromTemplateClass().execute(template, tokenKey, tokenType);

export const applyMappingColorRef = (
  template: import('../../../model/schemas').Template,
  tokenKey: string,
  tokenType: import('../../../model/schemas').TokenType,
  colorVariableRef: string | null,
) => new SetMappingColorRefClass().execute(template, tokenKey, tokenType, colorVariableRef);

export const applyMappingContrastRef = (
  template: import('../../../model/schemas').Template,
  tokenKey: string,
  tokenType: import('../../../model/schemas').TokenType,
  contrastVariableRef: string | null,
) => new SetMappingContrastRefClass().execute(template, tokenKey, tokenType, contrastVariableRef);

export const applyMappingGroupRef = (
  template: import('../../../model/schemas').Template,
  tokenKey: string,
  tokenType: import('../../../model/schemas').TokenType,
  groupRef: string | null,
) => new SetMappingGroupRefClass().execute(template, tokenKey, tokenType, groupRef);

export const lockTemplateEntity = (template: import('../../../model/schemas').Template) =>
  new LockTemplateClass().execute(template);

export const generateSemanticVariantKey = (type: string) =>
  new GenerateSemanticVariantKeyClass().execute(type);

export const mergeSemanticTokenSets = (
  template: import('../../../model/schemas').Template,
  modifiers: readonly string[],
  language: string | null,
) => new MergeSemanticTokenSetsClass().execute(template, modifiers, language);

export const appendSemanticVariantToTemplate = (
  template: import('../../../model/schemas').Template,
  mapping: import('../../../model/schemas').Mapping,
  semanticTokenModifiers: readonly string[],
  semanticTokenLanguages: readonly string[],
) =>
  new AppendSemanticVariantToTemplateClass().execute(
    template,
    mapping,
    semanticTokenModifiers,
    semanticTokenLanguages,
  );

export const updateSemanticVariantKeyInTemplate = (
  template: import('../../../model/schemas').Template,
  oldKey: string,
  newKey: string,
  semanticTokenModifiers: readonly string[],
  semanticTokenLanguages: readonly string[],
) =>
  new UpdateSemanticVariantKeyInTemplateClass().execute(
    template,
    oldKey,
    newKey,
    semanticTokenModifiers,
    semanticTokenLanguages,
  );

export const addGroupToTemplate = (template: import('../../../model/schemas').Template, name: string) =>
  new AddGroupToTemplateClass().execute(template, name);

export const removeGroupFromTemplate = (template: import('../../../model/schemas').Template, groupName: string) =>
  new RemoveGroupFromTemplateClass().execute(template, groupName);

export const applyVariableGroupRefUpdate = (
  template: import('../../../model/schemas').Template,
  variableKey: string,
  groupRef: string | null,
) => new UpdateVariableGroupRefClass().execute(template, variableKey, groupRef);

export const addColorVariableToTemplate = (
  template: import('../../../model/schemas').Template,
  key: string,
  groupRef?: string | null,
) => new AddColorVariableClass().execute(template, key, groupRef);

export const removeColorVariableFromTemplate = (template: import('../../../model/schemas').Template, key: string) =>
  new RemoveColorVariableClass().execute(template, key);

export const addContrastVariableToTemplate = (
  template: import('../../../model/schemas').Template,
  key: string,
  groupRef?: string | null,
) => new AddContrastVariableClass().execute(template, key, groupRef);

export const removeContrastVariableFromTemplate = (
  template: import('../../../model/schemas').Template,
  key: string,
) => new RemoveContrastVariableClass().execute(template, key);

export const applyContrastComparisonSourceUpdate = (
  template: import('../../../model/schemas').Template,
  contrastVariableKey: string,
  comparisonSourceRef: import('../../../model/schemas').ColorVariableKey | null,
) =>
  new UpdateContrastComparisonSourceClass().execute(template, contrastVariableKey, comparisonSourceRef);
