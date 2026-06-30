import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TemplatesPage } from './template-page/TemplatesPage';
import { TemplatesCard } from './templates-card/TemplatesCard';
import { CreateTemplateDialog } from './create-template-dialog/CreateTemplateDialog';
import { TemplateDetailsCard } from './template-details-card/TemplateDetailsCard';
import { TemplateCatalogsCard } from './template-catalogs-card/TemplateCatalogsCard';
import { GroupsCard } from './groups-card/GroupsCard';
import { VariablesCard } from './variables-card/VariablesCard';
import { MappingsCard } from './mappings-card/MappingsCard';
import { SelectTemplateAndLoadController } from './templates-card/controllers/select-template-and-load-controller';
import { AddColorVariableController } from './variables-card/controllers/add-color-variable-controller';
import { AddGroupController } from './groups-card/controllers/add-group-controller';
import { SetMappingGroupRefController } from './mappings-card/controllers/set-mapping-group-ref-controller';
import { ApplySelectedMappingAssignmentController } from './mappings-card/controllers/apply-selected-mapping-assignment-controller';
import { RemoveGroupController } from './groups-card/controllers/remove-group-controller';
import { ToggleCatalogController } from './template-catalogs-card/controllers/toggle-catalog-controller';
import { CreateTemplateController } from './create-template-dialog/controllers/create-template-controller';
import { DeleteCurrentTemplateVersionController } from './template-details-card/controllers/delete-current-template-version-controller';
import { RemoveVariableController } from './variables-card/controllers/remove-variable-controller';
import { CatalogUiStore } from '../../domain/state/ui/catalog-ui-store';
import { TemplateUiStore } from '../../domain/state/ui/template-ui-store';
import { ThemeUiStore } from '../../domain/state/ui/theme-ui-store';
import { TemplatesStore } from '../../domain/state/data/templates-store';
import { CatalogsStore } from '../../domain/catalog/state/catalogs-store';
import { UndoStackStore } from '../../domain/state/undo-stack/undo-stack-store';
import { BumpTemplateVersionForEditOperation } from '../../domain/operations/template-operations/template-details/bump-template-version-for-edit-operation';
import { AddColorVariableOperation } from '../../domain/operations/template-operations/variables-color/add-color-variable-operation';
import { AddGroupToTemplateOperation } from '../../domain/operations/template-operations/groups/add-group-to-template-operation';
import { SetMappingGroupRefOperation } from '../../domain/operations/template-operations/mappings/set-mapping-group-ref-operation';
import { ApplyMappingAssignmentOperation } from '../../domain/operations/template-operations/mappings/apply-mapping-assignment-operation';
import { RemoveGroupFromTemplateOperation } from '../../domain/operations/template-operations/groups/remove-group-from-template-operation';
import { SetSelectedTemplateRefOperation } from '../../domain/operations/template-operations/template-list/set-selected-template-ref-operation';
import { SetTemplateOperation } from '../../domain/operations/template-operations/template-details/set-template-operation';
import { RemoveColorVariableOperation } from '../../domain/operations/template-operations/variables-color/remove-color-variable-operation';
import { RemoveContrastVariableOperation } from '../../domain/operations/template-operations/variables-contrast/remove-contrast-variable-operation';
import { ValidateCanRemoveVariable } from '../../domain/validations/template-validations/validate-can-remove-variable';
import { CreateTemplateDialogStore } from '../../domain/state/ui/create-template-dialog-store';
import { ApplyTemplateLifecycleUndoOperation } from '../../domain/operations/undo-operations/apply-template-lifecycle-undo-operation';
import { ApplyTemplateUndoStateOperation } from '../../domain/operations/undo-operations/apply-template-undo-state-operation';
import { RecordTemplateUndoOperation } from '../../domain/operations/undo-operations/record-template-undo-operation';
import { RecordUndoEntryOperation } from '../../domain/operations/undo-operations/record-undo-entry-operation';
import { undoManagerV2 } from '../../domain/core/undo-manager-v2';
import {
  createTestBuildUniversalUndoProcessor,
  createTestUndoOperations,
  removeTemplateVersion,
  syncContinuation,
  waitForUndoRecorded,
} from '../../../test/undo/test-universal-undo-processor';
import { templateSchema } from '../../model/schema/template-schemas';
import { catalogSchema } from '../../model/schema/catalog';

const viewModelMocks = vi.hoisted(() => ({
  useTemplateViewModel: vi.fn(),
  useTemplatesCardViewModel: vi.fn(),
  useCreateTemplateDialogViewModel: vi.fn(),
  useTemplateDetailsCardViewModel: vi.fn(),
  useTemplateCatalogsCardViewModel: vi.fn(),
  useGroupsCardViewModel: vi.fn(),
  useVariablesCardViewModel: vi.fn(),
  useMappingsCardViewModel: vi.fn(),
}));

vi.mock('./template-page/use-template-viewmodel', () => ({
  useTemplateViewModel: viewModelMocks.useTemplateViewModel,
}));

vi.mock('./templates-card/use-templates-card-viewmodel', () => ({
  useTemplatesCardViewModel: viewModelMocks.useTemplatesCardViewModel,
}));

vi.mock('./create-template-dialog/use-create-template-dialog-viewmodel', () => ({
  useCreateTemplateDialogViewModel: viewModelMocks.useCreateTemplateDialogViewModel,
}));

vi.mock('./template-details-card/use-template-details-card-viewmodel', () => ({
  useTemplateDetailsCardViewModel: viewModelMocks.useTemplateDetailsCardViewModel,
}));

vi.mock('./template-catalogs-card/use-template-catalogs-card-viewmodel', () => ({
  useTemplateCatalogsCardViewModel: viewModelMocks.useTemplateCatalogsCardViewModel,
}));

vi.mock('./groups-card/use-groups-card-viewmodel', () => ({
  useGroupsCardViewModel: viewModelMocks.useGroupsCardViewModel,
}));

vi.mock('./variables-card/use-variables-card-viewmodel', () => ({
  useVariablesCardViewModel: viewModelMocks.useVariablesCardViewModel,
}));

vi.mock('./mappings-card/use-mappings-card-viewmodel', () => ({
  useMappingsCardViewModel: viewModelMocks.useMappingsCardViewModel,
}));

describe('template renderer workflows', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    viewModelMocks.useTemplatesCardViewModel.mockReturnValue({
      templateNames: [],
      selectedName: null,
      versionsForSelectedName: [],
      selectedRef: null,
      onSelectName: vi.fn(),
      onSelectVersion: vi.fn(),
      onCreateClick: vi.fn(),
      isCreating: false,
    });
    viewModelMocks.useCreateTemplateDialogViewModel.mockReturnValue({
      name: '',
      canSubmit: false,
      showNameError: false,
      onNameChange: vi.fn(),
      onCancelClick: vi.fn(),
      onOkClick: vi.fn(),
    });
    viewModelMocks.useTemplateDetailsCardViewModel.mockReturnValue({
      template: null,
      canLock: false,
      canShowLockButton: false,
      lockButtonTitle: '',
      onDeleteVersionClick: vi.fn(),
      onLockClick: vi.fn(),
    });
    viewModelMocks.useTemplateCatalogsCardViewModel.mockReturnValue({
      template: null,
      catalogRows: [],
      shouldShowUpdateAllCatalogsButton: false,
      onUpdateAllCatalogsClick: vi.fn(),
      onToggleCatalogClick: vi.fn(),
      onCatalogVersionChange: vi.fn(),
    });
    viewModelMocks.useGroupsCardViewModel.mockReturnValue({
      template: null,
      groupRows: [],
      canEdit: false,
      addGroupName: '',
      canAddGroup: false,
      onRemoveGroupClick: vi.fn(),
      onAddGroupNameChange: vi.fn(),
      onAddGroupClick: vi.fn(),
    });
    viewModelMocks.useVariablesCardViewModel.mockReturnValue({
      template: null,
      colorVariables: [],
      contrastVariables: [],
      groups: [],
      sortedGroups: [],
      filteredColorVariables: [],
      filteredContrastVariables: [],
      sortedColorVariables: [],
      colorVariableGroupSections: [],
      contrastVariableGroupSections: [],
      variablesSearchText: '',
      addVariableNames: {},
      canEdit: false,
      getAddVariableName: vi.fn(() => ''),
      canAddVariable: vi.fn(() => false),
      referencedColorVarKeys: new Set<string>(),
      referencedContrastVarKeys: new Set<string>(),
      onAddVariableNameChange: vi.fn(),
      onAddColorVariableClick: vi.fn(),
      onRemoveColorVariableClick: vi.fn(),
      onAddContrastVariableClick: vi.fn(),
      onRemoveContrastVariableClick: vi.fn(),
      onUpdateColorVariableGroupRef: vi.fn(),
      onUpdateContrastVariableGroupRef: vi.fn(),
      onUpdateContrastComparisonSource: vi.fn(),
      onVariablesSearchChange: vi.fn(),
    });
    viewModelMocks.useMappingsCardViewModel.mockReturnValue({
      template: null,
      mappingsByType: { theme: [], 'textmate token': [], 'semantic token': [] },
      mappingsByGroup: new Map(),
      groupKeysInOrder: [],
      sortedGroups: [],
      sortedColorVariables: [],
      sortedContrastVariables: [],
      sortedSemanticTokenModifiers: [],
      sortedSemanticTokenLanguages: [],
      orphanKeys: new Set<string>(),
      canEdit: false,
      mappingSearchText: '',
      mappingColorVariableFilter: [],
      mappingContrastVariableFilter: [],
      selectedMappingIds: [],
      selectedVisibleMappingIds: [],
      selectedMappingKeys: new Set<string>(),
      groupSelectionStates: new Map(),
      onUpdateGroupRef: vi.fn(),
      onUpdateColorRef: vi.fn(),
      onUpdateContrastRef: vi.fn(),
      semanticVariant: undefined,
      onRemoveMapping: vi.fn(),
      setMappingSearchText: vi.fn(),
      setMappingColorVariableFilter: vi.fn(),
      setMappingContrastVariableFilter: vi.fn(),
      toggleMappingSelection: vi.fn(),
      clearMappingSelection: vi.fn(),
      applySelectedMappingAssignment: vi.fn(),
    });
  });

  it('renders template page loading and loaded states', () => {
    viewModelMocks.useTemplateViewModel.mockReturnValue({
      isPageLoading: true,
      isTemplateLoading: false,
      isTemplateLoaded: false,
      isCreateDialogOpen: false,
    });

    const view = render(<TemplatesPage />);
    expect(view.getByText('Loading templates...')).toBeInTheDocument();

    viewModelMocks.useTemplateViewModel.mockReturnValue({
      isPageLoading: false,
      isTemplateLoading: true,
      isTemplateLoaded: false,
      isCreateDialogOpen: false,
    });
    view.rerender(<TemplatesPage />);
    expect(view.getByRole('heading', { name: 'Templates' })).toBeInTheDocument();
    expect(view.getByText('Loading template...')).toBeInTheDocument();

    const template = {
      name: 'template-a',
      version: '1.0.0',
      locked: false,
      catalogRefs: [],
      mappings: [],
      colorVariables: [],
      contrastVariables: [],
      groups: [],
      semanticTokenModifiers: [],
      semanticTokenLanguages: [],
    };
    viewModelMocks.useTemplateViewModel.mockReturnValue({
      isPageLoading: false,
      isTemplateLoading: false,
      isTemplateLoaded: true,
      isCreateDialogOpen: true,
    });
    viewModelMocks.useTemplateDetailsCardViewModel.mockReturnValue({
      template,
      canLock: false,
      canShowLockButton: false,
      lockButtonTitle: '',
      onDeleteVersionClick: vi.fn(),
      onLockClick: vi.fn(),
    });
    viewModelMocks.useTemplateCatalogsCardViewModel.mockReturnValue({
      template,
      catalogRows: [],
      shouldShowUpdateAllCatalogsButton: false,
      onUpdateAllCatalogsClick: vi.fn(),
      onToggleCatalogClick: vi.fn(),
      onCatalogVersionChange: vi.fn(),
    });
    viewModelMocks.useGroupsCardViewModel.mockReturnValue({
      template,
      groupRows: [],
      canEdit: false,
      addGroupName: '',
      canAddGroup: false,
      onRemoveGroupClick: vi.fn(),
      onAddGroupNameChange: vi.fn(),
      onAddGroupClick: vi.fn(),
    });
    viewModelMocks.useVariablesCardViewModel.mockReturnValue({
      template,
      colorVariables: [],
      contrastVariables: [],
      groups: [],
      sortedGroups: [],
      filteredColorVariables: [],
      filteredContrastVariables: [],
      sortedColorVariables: [],
      colorVariableGroupSections: [],
      contrastVariableGroupSections: [],
      variablesSearchText: '',
      addVariableNames: {},
      canEdit: false,
      getAddVariableName: vi.fn(() => ''),
      canAddVariable: vi.fn(() => false),
      referencedColorVarKeys: new Set<string>(),
      referencedContrastVarKeys: new Set<string>(),
      onAddVariableNameChange: vi.fn(),
      onAddColorVariableClick: vi.fn(),
      onRemoveColorVariableClick: vi.fn(),
      onAddContrastVariableClick: vi.fn(),
      onRemoveContrastVariableClick: vi.fn(),
      onUpdateColorVariableGroupRef: vi.fn(),
      onUpdateContrastVariableGroupRef: vi.fn(),
      onUpdateContrastComparisonSource: vi.fn(),
      onVariablesSearchChange: vi.fn(),
    });
    viewModelMocks.useMappingsCardViewModel.mockReturnValue({
      template,
      mappingsByType: { theme: [], 'textmate token': [], 'semantic token': [] },
      mappingsByGroup: new Map(),
      groupKeysInOrder: [],
      sortedGroups: [],
      sortedColorVariables: [],
      sortedContrastVariables: [],
      sortedSemanticTokenModifiers: [],
      sortedSemanticTokenLanguages: [],
      orphanKeys: new Set<string>(),
      canEdit: false,
      mappingSearchText: '',
      mappingColorVariableFilter: [],
      mappingContrastVariableFilter: [],
      selectedMappingIds: [],
      selectedVisibleMappingIds: [],
      selectedMappingKeys: new Set<string>(),
      groupSelectionStates: new Map(),
      onUpdateGroupRef: vi.fn(),
      onUpdateColorRef: vi.fn(),
      onUpdateContrastRef: vi.fn(),
      semanticVariant: undefined,
      onRemoveMapping: vi.fn(),
      setMappingSearchText: vi.fn(),
      setMappingColorVariableFilter: vi.fn(),
      setMappingContrastVariableFilter: vi.fn(),
      toggleMappingSelection: vi.fn(),
      clearMappingSelection: vi.fn(),
      applySelectedMappingAssignment: vi.fn(),
    });
    view.rerender(<TemplatesPage />);
    expect(view.getByRole('heading', { name: 'Template Details' })).toBeInTheDocument();
    expect(view.getByRole('heading', { name: 'Catalogs' })).toBeInTheDocument();
    expect(view.getByRole('heading', { name: 'Mappings' })).toBeInTheDocument();
    expect(view.getByRole('heading', { name: 'Groups' })).toBeInTheDocument();
    expect(view.getByRole('heading', { name: 'Variables' })).toBeInTheDocument();
    expect(view.getByRole('heading', { name: 'Create New Template' })).toBeInTheDocument();
  });

  it('selects a template-scoped undo stack when template references change', async () => {
    const setSelectedTemplateRef = { execute: vi.fn() };
    const loadTemplate = { execute: vi.fn(async () => ({ catalogRefs: [] })) };
    const loadCatalogForDisplay = { execute: vi.fn() };
    const catalogUiStore = {
      getStore: () => ({ state: { selectedRef: { name: 'catalog-a', version: '2.0.0' } } }),
    };
    const themeUiStore = {
      getStore: () => ({ state: { selectedRef: { name: 'theme-a', version: '3.0.0' } } }),
    };
    const setCurrentUndoStackId = { executeAndLoadForContext: vi.fn() };
    const controller = new SelectTemplateAndLoadController(
      setSelectedTemplateRef as never,
      loadTemplate as never,
      loadCatalogForDisplay as never,
      catalogUiStore as never,
      themeUiStore as never,
      setCurrentUndoStackId as never,
    );

    await controller.run('template-a', '1.0.0');
    await controller.run('template-a', '1.0.1');

    expect(setCurrentUndoStackId.executeAndLoadForContext).toHaveBeenNthCalledWith(1, expect.objectContaining({
      contextKey: 'tab=templates|template=template-a@1.0.0|catalog=catalog-a@2.0.0|theme=theme-a@3.0.0',
    }));
    expect(setCurrentUndoStackId.executeAndLoadForContext).toHaveBeenNthCalledWith(2, expect.objectContaining({
      contextKey: 'tab=templates|template=template-a@1.0.1|catalog=catalog-a@2.0.0|theme=theme-a@3.0.0',
    }));
  });

  it('supports template selection and create actions', async () => {
    const user = userEvent.setup();
    const onSelectName = vi.fn();
    const onSelectVersion = vi.fn();
    const onCreateClick = vi.fn();
    viewModelMocks.useTemplatesCardViewModel.mockReturnValue({
      templateNames: ['template-a', 'template-b'],
      selectedName: 'template-a',
      versionsForSelectedName: [
        { name: 'template-a', version: '1.0.1' },
        { name: 'template-a', version: '1.0.0' },
      ],
      selectedRef: { name: 'template-a', version: '1.0.1' },
      onSelectName,
      onSelectVersion,
      onCreateClick,
      isCreating: false,
    });

    const view = render(<TemplatesCard />);
    const selects = view.getAllByRole('combobox');
    await user.selectOptions(selects[0], 'template-b');
    expect(onSelectName).toHaveBeenCalledWith('template-b');
    await user.selectOptions(selects[1], '1.0.0');
    expect(onSelectVersion).toHaveBeenCalledWith('1.0.0');
    await user.click(view.getByRole('button', { name: 'Create new template' }));
    expect(onCreateClick).toHaveBeenCalledTimes(1);
  });

  it('supports template create dialog interactions', async () => {
    const user = userEvent.setup();
    const onNameChange = vi.fn();
    const onCancelClick = vi.fn();
    const onOkClick = vi.fn();
    viewModelMocks.useCreateTemplateDialogViewModel.mockReturnValue({
      name: 'starter',
      canSubmit: false,
      showNameError: true,
      onNameChange,
      onCancelClick,
      onOkClick,
    });

    const view = render(<CreateTemplateDialog />);
    await user.type(view.getByPlaceholderText('my-template'), 'x');
    expect(onNameChange).toHaveBeenLastCalledWith('starterx');
    expect(view.getByText('Alphanumeric characters and hyphens only.')).toBeInTheDocument();
    expect(view.getByRole('button', { name: 'OK' })).toBeDisabled();
    await user.click(view.getByRole('button', { name: 'Cancel' }));
    expect(onCancelClick).toHaveBeenCalledTimes(1);
    await user.click(view.container.querySelector('.dialog-overlay')!);
    expect(onCancelClick).toHaveBeenCalledTimes(2);
    expect(onOkClick).not.toHaveBeenCalled();
  });

  it('supports template details and catalog inclusion actions', async () => {
    const user = userEvent.setup();
    const onDeleteVersionClick = vi.fn();
    const onLockClick = vi.fn();
    const onUpdateAllCatalogsClick = vi.fn();
    const onToggleCatalogClick = vi.fn();
    const onCatalogVersionChange = vi.fn();
    const template = {
      name: 'template-a',
      version: '1.0.1',
      locked: false,
      catalogRefs: [{ name: 'catalog-a', version: '1.0.0' }],
      mappings: [{ token: { key: 'editor.foreground', type: 'theme' }, colorVariableRef: null, contrastVariableRef: null, groupRef: null }],
      colorVariables: [],
      contrastVariables: [],
      styleVariables: [{ key: 'emphasis', groupRef: null }],
      groups: [],
      semanticTokenModifiers: [],
      semanticTokenLanguages: [],
    };
    viewModelMocks.useTemplateDetailsCardViewModel.mockReturnValue({
      template,
      canLock: false,
      canShowLockButton: true,
      lockButtonTitle: 'All mappings must have a color variable assigned',
      onDeleteVersionClick,
      onLockClick,
    });
    viewModelMocks.useTemplateCatalogsCardViewModel.mockReturnValue({
      template,
      catalogRows: [
        {
          name: 'catalog-a',
          isIncluded: true,
          selectedVersion: '1.0.0',
          versions: [
            { name: 'catalog-a', version: '1.0.1' },
            { name: 'catalog-a', version: '1.0.0' },
          ],
          hasUpdate: true,
        },
      ],
      shouldShowUpdateAllCatalogsButton: true,
      onUpdateAllCatalogsClick,
      onToggleCatalogClick,
      onCatalogVersionChange,
    });

    const detailsView = render(<TemplateDetailsCard />);
    expect(detailsView.getByText('template-a')).toBeInTheDocument();
    expect(detailsView.container).toHaveTextContent('Style variables1');
    expect(detailsView.getByRole('button', { name: 'Lock' })).toBeDisabled();
    await user.click(detailsView.getByRole('button', { name: 'Delete version' }));
    expect(onDeleteVersionClick).toHaveBeenCalledTimes(1);

    const catalogsView = render(<TemplateCatalogsCard />);
    await user.click(catalogsView.getByRole('button', { name: 'Update All' }));
    expect(onUpdateAllCatalogsClick).toHaveBeenCalledTimes(1);
    await user.click(catalogsView.getByRole('checkbox', { name: 'Include catalog catalog-a' }));
    expect(onToggleCatalogClick).toHaveBeenCalledWith('catalog-a');
    await user.selectOptions(catalogsView.getByRole('combobox'), '1.0.1');
    expect(onCatalogVersionChange).toHaveBeenCalledWith('catalog-a', '1.0.1');
  });

  it('supports groups, variables, and mappings interactions', async () => {
    const user = userEvent.setup();
    const groupCallbacks = {
      onRemoveGroupClick: vi.fn(),
      onAddGroupNameChange: vi.fn(),
      onAddGroupClick: vi.fn(),
    };
    const variableCallbacks = {
      onAddVariableNameChange: vi.fn(),
      onAddColorVariableClick: vi.fn(),
      onRemoveColorVariableClick: vi.fn(),
      onAddContrastVariableClick: vi.fn(),
      onRemoveContrastVariableClick: vi.fn(),
      onUpdateColorVariableGroupRef: vi.fn(),
      onUpdateContrastVariableGroupRef: vi.fn(),
      onUpdateContrastComparisonSource: vi.fn(),
      onVariablesSearchChange: vi.fn(),
    };
    const mappingCallbacks = {
      onUpdateGroupRef: vi.fn(),
      onUpdateColorRef: vi.fn(),
      onUpdateContrastRef: vi.fn(),
      onUpdateStyleRef: vi.fn(),
      onUpdateIgnored: vi.fn(),
      onRemoveMapping: vi.fn(),
      setMappingSearchText: vi.fn(),
      setMappingColorVariableFilter: vi.fn(),
      setMappingContrastVariableFilter: vi.fn(),
      setMappingStyleVariableFilter: vi.fn(),
      toggleMappingSelection: vi.fn(),
      setMappingGroupSelection: vi.fn(),
      setMappingTokenTypeSelection: vi.fn(),
      clearMappingSelection: vi.fn(),
      applySelectedMappingAssignment: vi.fn(),
      semanticVariant: {
        onAddSemanticVariant: vi.fn(),
        onCommitSemanticTokenModifiers: vi.fn(),
        onCommitSemanticTokenLanguage: vi.fn(),
      },
    };
    const template = {
      name: 'template-a',
      version: '1.0.1',
      locked: false,
      catalogRefs: [{ name: 'catalog-a', version: '1.0.0' }],
      mappings: [
        { token: { key: 'editor.foreground', type: 'theme' }, colorVariableRef: 'editorFg', contrastVariableRef: null, groupRef: 'core' },
        { token: { key: 'keyword.control', type: 'textmate token' }, colorVariableRef: 'editorFg', contrastVariableRef: null, groupRef: null },
        { token: { key: 'variable', type: 'semantic token' }, colorVariableRef: 'editorFg', contrastVariableRef: 'contrastMain', groupRef: 'core' },
      ],
      colorVariables: [{ key: 'editorFg', groupRef: 'core' }],
      contrastVariables: [{ key: 'contrastMain', comparisonSourceRef: 'editorFg', groupRef: null }],
      groups: ['core'],
      semanticTokenModifiers: ['readonly'],
      semanticTokenLanguages: ['typescript'],
    };
    viewModelMocks.useGroupsCardViewModel.mockReturnValue({
      template,
      groupRows: [{ name: 'core', isInUse: true, removeButtonTitle: 'Cannot remove: group has mappings or variables' }],
      canEdit: true,
      addGroupName: 'extras',
      canAddGroup: true,
      ...groupCallbacks,
    });
    viewModelMocks.useVariablesCardViewModel.mockReturnValue({
      template,
      colorVariables: template.colorVariables,
      contrastVariables: template.contrastVariables,
      groups: template.groups,
      sortedGroups: template.groups,
      filteredColorVariables: template.colorVariables,
      filteredContrastVariables: template.contrastVariables,
      sortedColorVariables: template.colorVariables,
      colorVariableGroupSections: [{
        groupKey: 'core',
        groupLabel: 'core',
        groupRef: 'core',
        variables: template.colorVariables,
      }, {
        groupKey: '__ungrouped__',
        groupLabel: 'Ungrouped',
        groupRef: null,
        variables: [],
      }],
      contrastVariableGroupSections: [{
        groupKey: '__ungrouped__',
        groupLabel: 'Ungrouped',
        groupRef: null,
        variables: template.contrastVariables,
      }],
      variablesSearchText: '',
      addVariableNames: { 'color:core': 'accent', 'contrast:__ungrouped__': 'accentContrast' },
      canEdit: true,
      getAddVariableName: vi.fn((kind: string, groupRef: string | null) =>
        kind === 'color' && groupRef === 'core' ? 'accent' : kind === 'contrast' && groupRef === null ? 'accentContrast' : '',
      ),
      canAddVariable: vi.fn(() => true),
      referencedColorVarKeys: new Set<string>(['editorFg']),
      referencedContrastVarKeys: new Set<string>(['contrastMain']),
      ...variableCallbacks,
    });
    viewModelMocks.useMappingsCardViewModel.mockReturnValue({
      template,
      mappingsByType: {
        theme: [template.mappings[0]],
        'textmate token': [template.mappings[1]],
        'semantic token': [template.mappings[2]],
      },
      mappingsByGroup: new Map([
        ['core', {
          theme: [template.mappings[0]],
          'textmate token': [],
          'semantic token': [template.mappings[2]],
        }],
        ['__ungrouped__', {
          theme: [],
          'textmate token': [template.mappings[1]],
          'semantic token': [],
        }],
      ]),
      groupKeysInOrder: ['core', '__ungrouped__'],
      sortedGroups: template.groups,
      sortedColorVariables: template.colorVariables,
      sortedContrastVariables: template.contrastVariables,
      sortedSemanticTokenModifiers: template.semanticTokenModifiers,
      sortedSemanticTokenLanguages: template.semanticTokenLanguages,
      orphanKeys: new Set<string>(),
      canEdit: true,
      mappingSearchText: 'editor',
      mappingColorVariableFilter: [],
      mappingContrastVariableFilter: [],
      selectedMappingIds: [],
      selectedVisibleMappingIds: [],
      selectedMappingKeys: new Set<string>(),
      groupSelectionStates: new Map(),
      ...mappingCallbacks,
    });

    const groupsView = render(<GroupsCard />);
    await user.type(groupsView.getByPlaceholderText('Group name…'), 'x');
    expect(groupCallbacks.onAddGroupNameChange).toHaveBeenCalled();
    await user.click(groupsView.getByTitle('Add group'));
    expect(groupCallbacks.onAddGroupClick).toHaveBeenCalledTimes(1);

    const variablesView = render(<VariablesCard />);
    await user.type(variablesView.getByRole('textbox', { name: 'Search variables' }), 'x');
    expect(variableCallbacks.onVariablesSearchChange).toHaveBeenCalled();
    const addInputs = variablesView.getAllByPlaceholderText('new variable…');
    expect(addInputs).toHaveLength(3);
    expect(variablesView.getByRole('button', { name: /Ungrouped\(0\)/ })).toBeInTheDocument();
    expect(variablesView.getByRole('button', { name: /Ungrouped\(1\)/ })).toBeInTheDocument();
    await user.type(addInputs[0], 'x');
    expect(variableCallbacks.onAddVariableNameChange).toHaveBeenLastCalledWith('color', 'core', 'accentx');
    await user.type(addInputs[1], 'y');
    expect(variableCallbacks.onAddVariableNameChange).toHaveBeenLastCalledWith('color', null, 'y');
    await user.type(addInputs[2], 'z');
    expect(variableCallbacks.onAddVariableNameChange).toHaveBeenLastCalledWith('contrast', null, 'accentContrastz');
    const addButtons = variablesView.getAllByTitle('Add');
    await user.click(addButtons[0]);
    expect(variableCallbacks.onAddColorVariableClick).toHaveBeenCalledWith('core');
    const selects = variablesView.getAllByRole('combobox');
    await user.selectOptions(selects[0], '');
    expect(variableCallbacks.onUpdateColorVariableGroupRef).toHaveBeenCalledWith('editorFg', null);
    await user.selectOptions(selects[2], 'editorFg');
    expect(variableCallbacks.onUpdateContrastComparisonSource).toHaveBeenCalledWith('contrastMain', 'editorFg');

    const mappingsView = render(<MappingsCard />);
    await user.type(mappingsView.getByRole('textbox', { name: 'Search mappings' }), 'x');
    expect(mappingCallbacks.setMappingSearchText).toHaveBeenCalled();
    await user.click(mappingsView.getByRole('button', { name: 'Filter by color variable' }));
    await user.click(mappingsView.getByRole('checkbox', { name: 'Filter by color variable editorFg' }));
    expect(mappingCallbacks.setMappingColorVariableFilter).toHaveBeenCalled();
    await user.click(mappingsView.getAllByRole('button', { name: 'Add semantic token variant' })[0]);
    expect(mappingCallbacks.semanticVariant.onAddSemanticVariant).toHaveBeenCalled();
  });

  it('records, undoes, and redoes completed template variable and group edits', async () => {
    await undoManagerV2.clearPersisted();
    const templatesStore = new TemplatesStore();
    const templateUiStore = new TemplateUiStore();
    const catalogUiStore = new CatalogUiStore();
    const themeUiStore = new ThemeUiStore();
    const undoStackStore = new UndoStackStore();
    const saveTemplate = { execute: vi.fn() };
    const refreshTemplateRefsAndSelect = { execute: vi.fn() };
    const template = templateSchema.parse({
      name: 'template-a',
      version: '1.0.0',
      locked: false,
      catalogRefs: [],
      mappings: [],
      colorVariables: [],
      contrastVariables: [],
      groups: [],
    });
    templatesStore.getStore().updateTemplate(template);
    templateUiStore.getStore().selectTemplate({ name: 'template-a', version: '1.0.0' });
    const applyTemplateUndoState = new ApplyTemplateUndoStateOperation(
      templatesStore,
      templateUiStore,
      saveTemplate as never,
      refreshTemplateRefsAndSelect as never,
    );
    const buildUniversalUndoProcessor = createTestBuildUniversalUndoProcessor({
      applyCatalogUndoState: { execute: vi.fn() } as never,
      applyTemplateUndoState,
      applyThemeUndoState: { execute: vi.fn() } as never,
    });
    const testUndo = createTestUndoOperations(undoStackStore, buildUniversalUndoProcessor);
    const recordTemplateUndo = new RecordTemplateUndoOperation(
      new RecordUndoEntryOperation(undoStackStore),
      buildUniversalUndoProcessor,
    );
    const addVariable = new AddColorVariableController(
      templatesStore,
      templateUiStore,
      catalogUiStore,
      themeUiStore,
      new BumpTemplateVersionForEditOperation(),
      new AddColorVariableOperation(),
      saveTemplate as never,
      refreshTemplateRefsAndSelect as never,
      recordTemplateUndo,
      testUndo.setCurrentUndoStackId,
    );
    const addGroup = new AddGroupController(
      templatesStore,
      templateUiStore,
      catalogUiStore,
      themeUiStore,
      new BumpTemplateVersionForEditOperation(),
      new AddGroupToTemplateOperation(),
      saveTemplate as never,
      refreshTemplateRefsAndSelect as never,
      recordTemplateUndo,
      testUndo.setCurrentUndoStackId,
    );

    await addVariable.run('editorFg');
    await addGroup.run('core');
    expect(templatesStore.getStore().state.templates['template-a']?.['1.0.0']?.template?.groups).toEqual(['core']);
    expect(undoStackStore.getStore().state.undoMenu.frames).toHaveLength(3);

    await testUndo.undo.execute();
    expect(templatesStore.getStore().state.templates['template-a']?.['1.0.0']?.template?.groups).toEqual([]);

    await testUndo.redo.execute();
    expect(templatesStore.getStore().state.templates['template-a']?.['1.0.0']?.template?.groups).toEqual(['core']);
  });

  it('undoes and redoes a multi-mapping assignment as one history entry', async () => {
    await undoManagerV2.clearPersisted();
    const templatesStore = new TemplatesStore();
    const templateUiStore = new TemplateUiStore();
    const undoStackStore = new UndoStackStore();
    const template = templateSchema.parse({
      name: 'template-a',
      version: '1.0.0',
      locked: false,
      catalogRefs: [],
      groups: ['core'],
      colorVariables: [{ key: 'editorFg' }],
      contrastVariables: [],
      mappings: [
        { token: { key: 'one', type: 'theme' }, groupRef: null, colorVariableRef: null, contrastVariableRef: null },
        { token: { key: 'two', type: 'textmate token' }, groupRef: null, colorVariableRef: null, contrastVariableRef: null },
      ],
    });
    templatesStore.getStore().updateTemplate(template);
    templateUiStore.getStore().selectTemplate({ name: template.name, version: template.version });
    templateUiStore.getStore().setSelectedMappingIds([
      { tokenKey: 'one', tokenType: 'theme' },
      { tokenKey: 'two', tokenType: 'textmate token' },
    ]);
    const saveTemplate = { execute: vi.fn() };
    const refreshTemplateRefsAndSelect = {
      execute: vi.fn((_name: string, _version: string, next: typeof template) => {
        templatesStore.getStore().updateTemplate(next);
      }),
    };
    const buildUniversalUndoProcessor = createTestBuildUniversalUndoProcessor({
      applyCatalogUndoState: { execute: vi.fn() } as never,
      applyTemplateUndoState: new ApplyTemplateUndoStateOperation(
        templatesStore,
        templateUiStore,
        saveTemplate as never,
        refreshTemplateRefsAndSelect as never,
      ),
      applyThemeUndoState: { execute: vi.fn() } as never,
    });
    const testUndo = createTestUndoOperations(undoStackStore, buildUniversalUndoProcessor);
    const controller = new ApplySelectedMappingAssignmentController(
      templatesStore,
      templateUiStore,
      new CatalogsStore(),
      new CatalogUiStore(),
      new ThemeUiStore(),
      new ApplyMappingAssignmentOperation(),
      new BumpTemplateVersionForEditOperation(),
      saveTemplate as never,
      refreshTemplateRefsAndSelect as never,
      new RecordTemplateUndoOperation(
        new RecordUndoEntryOperation(undoStackStore),
        buildUniversalUndoProcessor,
      ),
      testUndo.setCurrentUndoStackId,
    );

    await controller.run({ kind: 'color', value: 'editorFg' });
    const currentMappings = () => templatesStore.getStore().state
      .templates['template-a']?.['1.0.0']?.template?.mappings;
    expect(currentMappings()?.map((mapping) => mapping.colorVariableRef))
      .toEqual(['editorFg', 'editorFg']);
    expect(undoStackStore.getStore().state.undoMenu.frames).toHaveLength(2);

    await testUndo.undo.execute();
    expect(currentMappings()?.map((mapping) => mapping.colorVariableRef)).toEqual([null, null]);

    await testUndo.redo.execute();
    expect(currentMappings()?.map((mapping) => mapping.colorVariableRef))
      .toEqual(['editorFg', 'editorFg']);
  });

  it('does not record template undo entries for rejected variable or group edits', async () => {
    await undoManagerV2.clearPersisted();
    const templatesStore = new TemplatesStore();
    const templateUiStore = new TemplateUiStore();
    const undoStackStore = new UndoStackStore();
    const saveTemplate = { execute: vi.fn() };
    const template = templateSchema.parse({
      name: 'template-a',
      version: '1.0.0',
      locked: false,
      catalogRefs: [],
      mappings: [],
      colorVariables: [{ key: 'editorFg', groupRef: null }],
      contrastVariables: [],
      groups: ['core'],
    });
    templatesStore.getStore().updateTemplate(template);
    templateUiStore.getStore().selectTemplate({ name: 'template-a', version: '1.0.0' });
    const refreshTemplateRefsAndSelect = { execute: vi.fn() };
    const buildUniversalUndoProcessor = createTestBuildUniversalUndoProcessor({
      applyCatalogUndoState: { execute: vi.fn() } as never,
      applyTemplateUndoState: new ApplyTemplateUndoStateOperation(
        templatesStore,
        templateUiStore,
        saveTemplate as never,
        refreshTemplateRefsAndSelect as never,
      ),
      applyThemeUndoState: { execute: vi.fn() } as never,
    });
    const testUndo = createTestUndoOperations(undoStackStore, buildUniversalUndoProcessor);
    const recordTemplateUndo = new RecordTemplateUndoOperation(
      new RecordUndoEntryOperation(undoStackStore),
      buildUniversalUndoProcessor,
    );
    const addVariable = new AddColorVariableController(
      templatesStore,
      templateUiStore,
      new CatalogUiStore(),
      new ThemeUiStore(),
      new BumpTemplateVersionForEditOperation(),
      new AddColorVariableOperation(),
      saveTemplate as never,
      refreshTemplateRefsAndSelect as never,
      recordTemplateUndo,
      testUndo.setCurrentUndoStackId,
    );
    const addGroup = new AddGroupController(
      templatesStore,
      templateUiStore,
      new CatalogUiStore(),
      new ThemeUiStore(),
      new BumpTemplateVersionForEditOperation(),
      new AddGroupToTemplateOperation(),
      saveTemplate as never,
      refreshTemplateRefsAndSelect as never,
      recordTemplateUndo,
      testUndo.setCurrentUndoStackId,
    );

    await addVariable.run('editorFg');
    await addVariable.run('   ');
    await addGroup.run('core');
    await addGroup.run('   ');

    expect(saveTemplate.execute).not.toHaveBeenCalled();
    expect(undoStackStore.getStore().state.undoMenu.canUndo).toBe(false);
  });

  describe('template undo round-trips', () => {
    function createTemplateUndoHarness(templatesStore: TemplatesStore, templateUiStore: TemplateUiStore) {
      const undoStackStore = new UndoStackStore();
      const saveTemplate = { execute: vi.fn() };
      const refreshTemplateRefsAndSelect = { execute: vi.fn() };
      const applyTemplateUndoState = new ApplyTemplateUndoStateOperation(
        templatesStore,
        templateUiStore,
        saveTemplate as never,
        refreshTemplateRefsAndSelect as never,
      );
      const deleteTemplate = {
        execute: vi.fn((name: string, version: string) => syncContinuation(() => {
          removeTemplateVersion(templatesStore, name, version);
        })),
      };
      const applyTemplateLifecycleUndo = new ApplyTemplateLifecycleUndoOperation(
        deleteTemplate as never,
        applyTemplateUndoState,
        { execute: vi.fn((ref) => templateUiStore.getStore().selectTemplate(ref)) } as never,
        { execute: vi.fn(async () => []) } as never,
        { execute: vi.fn() } as never,
        { execute: vi.fn() } as never,
      );
      const buildUniversalUndoProcessor = createTestBuildUniversalUndoProcessor({
        applyCatalogUndoState: { execute: vi.fn() } as never,
        applyTemplateUndoState,
        applyTemplateLifecycleUndo,
        applyThemeUndoState: { execute: vi.fn() } as never,
      });
      const testUndo = createTestUndoOperations(undoStackStore, buildUniversalUndoProcessor);
      const recordTemplateUndo = new RecordTemplateUndoOperation(
        new RecordUndoEntryOperation(undoStackStore),
        buildUniversalUndoProcessor,
      );
      return { undoStackStore, testUndo, recordTemplateUndo, saveTemplate };
    }

    function saveTemplateToStore(templatesStore: TemplatesStore) {
      return {
        execute: vi.fn((template: ReturnType<typeof templateSchema.parse>) => {
          templatesStore.getStore().updateTemplate(template);
        }),
      };
    }

    it('records, undoes, and redoes a mapping group ref change', async () => {
      await undoManagerV2.clearPersisted();
      const templatesStore = new TemplatesStore();
      const templateUiStore = new TemplateUiStore();
      const { testUndo, recordTemplateUndo, undoStackStore } = createTemplateUndoHarness(templatesStore, templateUiStore);
      const saveTemplate = saveTemplateToStore(templatesStore);
      const refreshTemplateRefsAndSelect = { execute: vi.fn() };
      const controller = new SetMappingGroupRefController(
        templatesStore,
        templateUiStore,
        new CatalogUiStore(),
        new ThemeUiStore(),
        new BumpTemplateVersionForEditOperation(),
        new SetMappingGroupRefOperation(),
        saveTemplate as never,
        refreshTemplateRefsAndSelect as never,
        recordTemplateUndo,
        testUndo.setCurrentUndoStackId,
      );
      const template = templateSchema.parse({
        name: 'template-a',
        version: '1.0.0',
        locked: false,
        catalogRefs: [],
        mappings: [{ token: { key: 'editor.foreground', type: 'theme' }, colorVariableRef: null, contrastVariableRef: null, groupRef: null }],
        colorVariables: [],
        contrastVariables: [],
        groups: ['core'],
      });
      templatesStore.getStore().updateTemplate(template);
      templateUiStore.getStore().selectTemplate({ name: 'template-a', version: '1.0.0' });

      await controller.run('editor.foreground', 'theme', 'core');
      expect(templatesStore.getStore().state.templates['template-a']?.['1.0.0']?.template?.mappings[0].groupRef)
        .toBe('core');

      await waitForUndoRecorded(undoStackStore);
      await testUndo.undo.execute();
      expect(templatesStore.getStore().state.templates['template-a']?.['1.0.0']?.template?.mappings[0].groupRef)
        .toBeNull();

      await testUndo.redo.execute();
      expect(templatesStore.getStore().state.templates['template-a']?.['1.0.0']?.template?.mappings[0].groupRef)
        .toBe('core');
    });

    it('records, undoes, and redoes a group removal', async () => {
      await undoManagerV2.clearPersisted();
      const templatesStore = new TemplatesStore();
      const templateUiStore = new TemplateUiStore();
      const { testUndo, recordTemplateUndo, undoStackStore } = createTemplateUndoHarness(templatesStore, templateUiStore);
      const saveTemplate = saveTemplateToStore(templatesStore);
      const refreshTemplateRefsAndSelect = { execute: vi.fn() };
      const controller = new RemoveGroupController(
        templatesStore,
        templateUiStore,
        new CatalogUiStore(),
        new ThemeUiStore(),
        new BumpTemplateVersionForEditOperation(),
        new RemoveGroupFromTemplateOperation(),
        saveTemplate as never,
        refreshTemplateRefsAndSelect as never,
        recordTemplateUndo,
        testUndo.setCurrentUndoStackId,
      );
      const template = templateSchema.parse({
        name: 'template-a',
        version: '1.0.0',
        locked: false,
        catalogRefs: [],
        mappings: [],
        colorVariables: [],
        contrastVariables: [],
        groups: ['extras', 'core'],
      });
      templatesStore.getStore().updateTemplate(template);
      templateUiStore.getStore().selectTemplate({ name: 'template-a', version: '1.0.0' });

      controller.run('extras');
      expect(templatesStore.getStore().state.templates['template-a']?.['1.0.0']?.template?.groups)
        .toEqual(['core']);

      await waitForUndoRecorded(undoStackStore);
      await testUndo.undo.execute();
      expect(templatesStore.getStore().state.templates['template-a']?.['1.0.0']?.template?.groups)
        .toEqual(['extras', 'core']);

      await testUndo.redo.execute();
      expect(templatesStore.getStore().state.templates['template-a']?.['1.0.0']?.template?.groups)
        .toEqual(['core']);
    });

    it('records, undoes, and redoes a catalog toggle', async () => {
      await undoManagerV2.clearPersisted();
      const templatesStore = new TemplatesStore();
      const templateUiStore = new TemplateUiStore();
      const { testUndo, recordTemplateUndo, undoStackStore } = createTemplateUndoHarness(templatesStore, templateUiStore);
      const saveTemplate = saveTemplateToStore(templatesStore);
      const refreshTemplateRefsAndSelect = { execute: vi.fn() };
      const controller = new ToggleCatalogController(
        templatesStore,
        templateUiStore,
        new CatalogUiStore(),
        new ThemeUiStore(),
        { execute: vi.fn(() => [{ name: 'catalog-a', version: '1.0.0' }]) } as never,
        { execute: vi.fn(async () => catalogSchema.parse({
          name: 'catalog-a',
          version: '1.0.0',
          type: 'manual',
          locked: false,
          sources: [],
          tokens: [{ key: 'editor.foreground', type: 'theme' }],
        })) } as never,
        new BumpTemplateVersionForEditOperation(),
        saveTemplate as never,
        refreshTemplateRefsAndSelect as never,
        recordTemplateUndo,
        testUndo.setCurrentUndoStackId,
      );
      const template = templateSchema.parse({
        name: 'template-a',
        version: '1.0.0',
        locked: false,
        catalogRefs: [],
        mappings: [],
        colorVariables: [],
        contrastVariables: [],
        groups: [],
      });
      templatesStore.getStore().updateTemplate(template);
      templateUiStore.getStore().selectTemplate({ name: 'template-a', version: '1.0.0' });

      await controller.run('catalog-a');
      expect(templatesStore.getStore().state.templates['template-a']?.['1.0.0']?.template?.catalogRefs)
        .toEqual([{ name: 'catalog-a', version: '1.0.0' }]);

      await waitForUndoRecorded(undoStackStore);
      await testUndo.undo.execute();
      expect(templatesStore.getStore().state.templates['template-a']?.['1.0.0']?.template?.catalogRefs)
        .toEqual([]);

      await testUndo.redo.execute();
      expect(templatesStore.getStore().state.templates['template-a']?.['1.0.0']?.template?.catalogRefs)
        .toEqual([{ name: 'catalog-a', version: '1.0.0' }]);
    });

    it('records, undoes, and redoes template creation', async () => {
      await undoManagerV2.clearPersisted();
      const templatesStore = new TemplatesStore();
      const templateUiStore = new TemplateUiStore();
      const createTemplateDialogStore = new CreateTemplateDialogStore();
      const { testUndo, recordTemplateUndo, undoStackStore } = createTemplateUndoHarness(templatesStore, templateUiStore);
      const createTemplate = {
        execute: vi.fn(async ({ name }: { name: string }) => templateSchema.parse({
          name,
          version: '1.0.0',
          locked: false,
          catalogRefs: [],
          mappings: [],
          colorVariables: [],
          contrastVariables: [],
          groups: [],
        })),
      };
      const controller = new CreateTemplateController(
        createTemplateDialogStore,
        templateUiStore,
        new CatalogUiStore(),
        new ThemeUiStore(),
        createTemplate as never,
        { execute: vi.fn(async () => []) } as never,
        new SetTemplateOperation(templatesStore, templateUiStore),
        new SetSelectedTemplateRefOperation(templatesStore, templateUiStore),
        { execute: vi.fn() } as never,
        { execute: vi.fn() } as never,
        recordTemplateUndo,
        testUndo.setCurrentUndoStackId,
      );
      createTemplateDialogStore.getStore().openCreateTemplateDialog();
      createTemplateDialogStore.getStore().setCreateTemplateDialogData('new-template');

      await controller.run();
      expect(templatesStore.getStore().state.templates['new-template']?.['1.0.0']?.template?.name)
        .toBe('new-template');

      await waitForUndoRecorded(undoStackStore);
      await testUndo.undo.execute();
      await vi.waitFor(() => {
        expect(templatesStore.getStore().state.templates['new-template']).toBeUndefined();
      });

      await testUndo.redo.execute();
      expect(templatesStore.getStore().state.templates['new-template']?.['1.0.0']?.template?.name)
        .toBe('new-template');
    });

    it('records, undoes, and redoes template version deletion', async () => {
      await undoManagerV2.clearPersisted();
      const templatesStore = new TemplatesStore();
      const templateUiStore = new TemplateUiStore();
      const { testUndo, recordTemplateUndo, undoStackStore } = createTemplateUndoHarness(templatesStore, templateUiStore);
      const deleteTemplate = {
        execute: vi.fn((name: string, version: string) => {
          removeTemplateVersion(templatesStore, name, version);
        }),
      };
      const controller = new DeleteCurrentTemplateVersionController(
        templateUiStore,
        templatesStore,
        new CatalogUiStore(),
        new ThemeUiStore(),
        deleteTemplate as never,
        { execute: vi.fn(async () => []) } as never,
        new SetSelectedTemplateRefOperation(templatesStore, templateUiStore),
        { execute: vi.fn(async () => null) } as never,
        new SetTemplateOperation(templatesStore, templateUiStore),
        recordTemplateUndo,
        testUndo.setCurrentUndoStackId,
      );
      const template = templateSchema.parse({
        name: 'template-a',
        version: '1.0.0',
        locked: false,
        catalogRefs: [],
        mappings: [],
        colorVariables: [{ key: 'editorFg', groupRef: null }],
        contrastVariables: [],
        groups: [],
      });
      templatesStore.getStore().updateTemplate(template);
      templateUiStore.getStore().selectTemplate({ name: 'template-a', version: '1.0.0' });

      await controller.run();
      expect(templatesStore.getStore().state.templates['template-a']?.['1.0.0']).toBeUndefined();

      await waitForUndoRecorded(undoStackStore);
      await testUndo.undo.execute();
      expect(templatesStore.getStore().state.templates['template-a']?.['1.0.0']?.template?.colorVariables[0].key)
        .toBe('editorFg');

      await testUndo.redo.execute();
      expect(templatesStore.getStore().state.templates['template-a']?.['1.0.0']).toBeUndefined();
    });
  });

  describe('template undo failure paths', () => {
    it('does not record undo entries when variable removal is rejected', async () => {
      await undoManagerV2.clearPersisted();
      const templatesStore = new TemplatesStore();
      const templateUiStore = new TemplateUiStore();
      const undoStackStore = new UndoStackStore();
      const testUndo = createTestUndoOperations(
        undoStackStore,
        createTestBuildUniversalUndoProcessor({
          applyCatalogUndoState: { execute: vi.fn() } as never,
          applyTemplateUndoState: new ApplyTemplateUndoStateOperation(
            templatesStore,
            templateUiStore,
            { execute: vi.fn() } as never,
            { execute: vi.fn() } as never,
          ),
          applyThemeUndoState: { execute: vi.fn() } as never,
        }),
      );
      const controller = new RemoveVariableController(
        templatesStore,
        templateUiStore,
        new CatalogUiStore(),
        new ThemeUiStore(),
        new ValidateCanRemoveVariable(),
        new BumpTemplateVersionForEditOperation(),
        new RemoveColorVariableOperation(),
        new RemoveContrastVariableOperation(),
        { execute: vi.fn() } as never,
        { execute: vi.fn() } as never,
        { execute: vi.fn() } as never,
        new RecordTemplateUndoOperation(
          new RecordUndoEntryOperation(undoStackStore),
          testUndo.buildUniversalUndoProcessor,
        ),
        testUndo.setCurrentUndoStackId,
      );
      const template = templateSchema.parse({
        name: 'template-a',
        version: '1.0.0',
        locked: false,
        catalogRefs: [],
        mappings: [{ token: { key: 'editor.foreground', type: 'theme' }, colorVariableRef: 'editorFg', contrastVariableRef: null, groupRef: null }],
        colorVariables: [{ key: 'editorFg', groupRef: null }],
        contrastVariables: [],
        groups: [],
      });
      templatesStore.getStore().updateTemplate(template);
      templateUiStore.getStore().selectTemplate({ name: 'template-a', version: '1.0.0' });

      controller.run('editorFg');
      expect(undoStackStore.getStore().state.undoMenu?.canUndo ?? false).toBe(false);
    });
  });
});
