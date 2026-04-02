import { container } from 'tsyringe';
import { TemplatesStateSetter } from '../../state/template/templates-state-reducer';
import type { SetTemplatesState } from '../../state/template/templates-state-reducer';
import { TemplateGateway } from '../../../gateway/template/template-gateway';

// template-list
export { LoadTemplateRefsOperation } from './template-list/load-template-refs-operation';
export { SetTemplateRefsOperation } from './template-list/set-template-refs-operation';
export { SetSelectedTemplateRefOperation } from './template-list/set-selected-template-ref-operation';
export { SetTemplateCreateFormNameOperation } from './template-list/set-template-create-form-name-operation';
export { CreateTemplateOperation } from './template-list/create-template-operation';
export { RefreshTemplateRefsOperation } from './template-list/refresh-template-refs-operation';
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

import { CreateTemplateOperation as CreateTemplateClass } from './template-list/create-template-operation';
import { DeleteTemplateOperation as DeleteTemplateClass } from './template-list/delete-template-operation';
import { LoadTemplateOperation as LoadTemplateClass } from './template-details/load-template-operation';
import { LoadTemplateSnapshotOperation as LoadTemplateSnapshotClass } from './template-details/load-template-snapshot-operation';
import { RefreshTemplateRefsOperation as RefreshTemplateRefsClass } from './template-list/refresh-template-refs-operation';
import { SaveTemplateOperation as SaveTemplateClass } from './template-details/save-template-operation';
import { SetSelectedTemplateRefOperation as SetSelectedTemplateRefClass } from './template-list/set-selected-template-ref-operation';
import { SetTemplateOperation as SetTemplateClass } from './template-details/set-template-operation';
import { SetTemplateCreateFormNameOperation as SetTemplateCreateFormNameClass } from './template-list/set-template-create-form-name-operation';
import { SetTemplateAddGroupNameOperation as SetTemplateAddGroupNameClass } from './variables/set-template-add-group-name-operation';
import { SetTemplateAddVariableNameOperation as SetTemplateAddVariableNameClass } from './variables/set-template-add-variable-name-operation';
import { SetTemplateVariablesSearchTextOperation as SetTemplateVariablesSearchTextClass } from './variables/set-template-variables-search-text-operation';
import { SetTemplateMappingSearchTextOperation as SetTemplateMappingSearchTextClass } from './mappings/set-template-mapping-search-text-operation';
import { SetTemplateMappingColorVariableFilterOperation as SetTemplateMappingColorVariableFilterClass } from './mappings/set-template-mapping-color-variable-filter-operation';
import { SetTemplateMappingContrastVariableFilterOperation as SetTemplateMappingContrastVariableFilterClass } from './mappings/set-template-mapping-contrast-variable-filter-operation';
import { SetTemplateMappingTokenGroupSelectionOperation as SetTemplateMappingTokenGroupSelectionClass } from './mappings/set-template-mapping-token-group-selection-operation';
import { BumpTemplateVersionForEditOperation as BumpTemplateVersionForEditClass } from './template-details/bump-template-version-for-edit-operation';
import { RemoveMappingFromTemplateOperation as RemoveMappingFromTemplateClass } from './mappings/remove-mapping-from-template-operation';
import { SetMappingColorRefOperation as SetMappingColorRefClass } from './mappings/set-mapping-color-ref-operation';
import { SetMappingContrastRefOperation as SetMappingContrastRefClass } from './mappings/set-mapping-contrast-ref-operation';
import { SetMappingGroupRefOperation as SetMappingGroupRefClass } from './mappings/set-mapping-group-ref-operation';
import { LockTemplateOperation as LockTemplateClass } from './template-details/lock-template-operation';
import { GenerateSemanticVariantKeyOperation as GenerateSemanticVariantKeyClass } from './mappings-semantic/generate-semantic-variant-key-operation';
import { MergeSemanticTokenSetsOperation as MergeSemanticTokenSetsClass } from './mappings-semantic/merge-semantic-token-sets-operation';
import { AppendSemanticVariantToTemplateOperation as AppendSemanticVariantToTemplateClass } from './mappings-semantic/append-semantic-variant-to-template-operation';
import { UpdateSemanticVariantKeyInTemplateOperation as UpdateSemanticVariantKeyInTemplateClass } from './mappings-semantic/update-semantic-variant-key-in-template-operation';
import { AddGroupToTemplateOperation as AddGroupToTemplateClass } from './groups/add-group-to-template-operation';
import { RemoveGroupFromTemplateOperation as RemoveGroupFromTemplateClass } from './groups/remove-group-from-template-operation';
import { UpdateVariableGroupRefOperation as UpdateVariableGroupRefClass } from './variables/update-variable-group-ref-operation';
import { AddColorVariableOperation as AddColorVariableClass } from './variables-color/add-color-variable-operation';
import { RemoveColorVariableOperation as RemoveColorVariableClass } from './variables-color/remove-color-variable-operation';
import { AddContrastVariableOperation as AddContrastVariableClass } from './variables-contrast/add-contrast-variable-operation';
import { RemoveContrastVariableOperation as RemoveContrastVariableClass } from './variables-contrast/remove-contrast-variable-operation';
import { UpdateContrastComparisonSourceOperation as UpdateContrastComparisonSourceClass } from './variables-contrast/update-contrast-comparison-source-operation';

/** @deprecated Backward compatibility — use injected TemplatesStateSetter */
export type SetState = SetTemplatesState;

/** @deprecated Backward-compatible function wrappers for controller migration */
export const createTemplate = (_setState: SetState, params: { name: string }) =>
  container.resolve(CreateTemplateClass).execute(params);

export const setTemplate = (_setState: SetState, template: import('../../../model/schemas').Template | null) =>
  new SetTemplateClass(new TemplatesStateSetter(_setState)).execute(template);

export const setSelectedTemplateRef = (
  _setState: SetState,
  ref: import('../../../model/schemas').TemplateReference | null,
) => new SetSelectedTemplateRefClass(new TemplatesStateSetter(_setState)).execute(ref);

export const refreshTemplateRefs = (_setTemplatesState: SetTemplatesState) =>
  new RefreshTemplateRefsClass(new TemplatesStateSetter(_setTemplatesState), container.resolve(TemplateGateway)).execute();

export const loadTemplate = (_setState: SetState, name: string, version: string) =>
  new LoadTemplateClass(new TemplatesStateSetter(_setState), container.resolve(TemplateGateway)).execute(name, version);

export const saveTemplate = (template: import('../../../model/schemas').Template) =>
  container.resolve(SaveTemplateClass).execute(template);

export const deleteTemplate = (name: string, version: string) =>
  container.resolve(DeleteTemplateClass).execute(name, version);

export const loadTemplateSnapshot = (name: string, version: string) =>
  container.resolve(LoadTemplateSnapshotClass).execute(name, version);

export const setTemplateCreateFormName = (_setState: SetState, value: string) =>
  new SetTemplateCreateFormNameClass(new TemplatesStateSetter(_setState)).execute(value);

export const setTemplateAddGroupName = (_setState: SetState, value: string) =>
  new SetTemplateAddGroupNameClass(new TemplatesStateSetter(_setState)).execute(value);

export const setTemplateAddVariableName = (_setState: SetState, value: string) =>
  new SetTemplateAddVariableNameClass(new TemplatesStateSetter(_setState)).execute(value);

export const setTemplateVariablesSearchText = (_setState: SetState, value: string) =>
  new SetTemplateVariablesSearchTextClass(new TemplatesStateSetter(_setState)).execute(value);

export const setTemplateMappingSearchText = (_setState: SetState, value: string) =>
  new SetTemplateMappingSearchTextClass(new TemplatesStateSetter(_setState)).execute(value);

export const setTemplateMappingColorVariableFilter = (_setState: SetState, values: string[]) =>
  new SetTemplateMappingColorVariableFilterClass(new TemplatesStateSetter(_setState)).execute(values);

export const setTemplateMappingContrastVariableFilter = (_setState: SetState, values: string[]) =>
  new SetTemplateMappingContrastVariableFilterClass(new TemplatesStateSetter(_setState)).execute(values);

export const setTemplateMappingTokenGroupSelection = (_setState: SetState, value: string) =>
  new SetTemplateMappingTokenGroupSelectionClass(new TemplatesStateSetter(_setState)).execute(value);

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
