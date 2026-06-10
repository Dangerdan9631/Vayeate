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
import { CatalogUiStore } from '../../domain/state/ui/catalog-ui-store';
import { TemplateUiStore } from '../../domain/state/ui/template-ui-store';
import { ThemeUiStore } from '../../domain/state/ui/theme-ui-store';
import { TemplatesStore } from '../../domain/state/data/templates-store';
import { UndoStackStore } from '../../domain/state/undo-stack/undo-stack-store';
import { BumpTemplateVersionForEditOperation } from '../../domain/operations/template-operations/template-details/bump-template-version-for-edit-operation';
import { AddColorVariableOperation } from '../../domain/operations/template-operations/variables-color/add-color-variable-operation';
import { AddGroupToTemplateOperation } from '../../domain/operations/template-operations/groups/add-group-to-template-operation';
import { RecordUndoEntryOperation } from '../../domain/operations/undo-operations/record-undo-entry-operation';
import { SetCurrentUndoStackIdOperation } from '../../domain/operations/undo-operations/set-current-undo-stack-id-operation';
import { UndoOperation } from '../../domain/operations/undo-operations/undo-operation';
import { RedoOperation } from '../../domain/operations/undo-operations/redo-operation';
import { undoManagerV2 } from '../../domain/core/undo-manager-v2';
import { templateSchema } from '../../model/schema/template-schemas';

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
      variablesSearchText: '',
      addVariableName: '',
      canEdit: false,
      canAddColorVariable: false,
      canAddContrastVariable: false,
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
      groups: [],
      colorVariables: [],
      contrastVariables: [],
      orphanKeys: new Set<string>(),
      canEdit: false,
      mappingSearchText: '',
      mappingColorVariableFilter: [],
      mappingContrastVariableFilter: [],
      onUpdateGroupRef: vi.fn(),
      onUpdateColorRef: vi.fn(),
      onUpdateContrastRef: vi.fn(),
      semanticVariant: undefined,
      onRemoveMapping: vi.fn(),
      setMappingSearchText: vi.fn(),
      setMappingColorVariableFilter: vi.fn(),
      setMappingContrastVariableFilter: vi.fn(),
    });
  });

  it('renders template page loading and loaded states', () => {
    viewModelMocks.useTemplateViewModel.mockReturnValueOnce({
      isPageLoading: true,
      isTemplateLoading: false,
      isTemplateLoaded: false,
      isCreateDialogOpen: false,
    });

    const view = render(<TemplatesPage />);
    expect(view.getByText('Loading templates...')).toBeInTheDocument();

    viewModelMocks.useTemplateViewModel.mockReturnValueOnce({
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
    viewModelMocks.useTemplateViewModel.mockReturnValueOnce({
      isPageLoading: false,
      isTemplateLoading: false,
      isTemplateLoaded: true,
      isCreateDialogOpen: true,
    });
    viewModelMocks.useTemplateDetailsCardViewModel.mockReturnValueOnce({
      template,
      canLock: false,
      canShowLockButton: false,
      lockButtonTitle: '',
      onDeleteVersionClick: vi.fn(),
      onLockClick: vi.fn(),
    });
    viewModelMocks.useTemplateCatalogsCardViewModel.mockReturnValueOnce({
      template,
      catalogRows: [],
      shouldShowUpdateAllCatalogsButton: false,
      onUpdateAllCatalogsClick: vi.fn(),
      onToggleCatalogClick: vi.fn(),
      onCatalogVersionChange: vi.fn(),
    });
    viewModelMocks.useGroupsCardViewModel.mockReturnValueOnce({
      template,
      groupRows: [],
      canEdit: false,
      addGroupName: '',
      canAddGroup: false,
      onRemoveGroupClick: vi.fn(),
      onAddGroupNameChange: vi.fn(),
      onAddGroupClick: vi.fn(),
    });
    viewModelMocks.useVariablesCardViewModel.mockReturnValueOnce({
      template,
      colorVariables: [],
      contrastVariables: [],
      groups: [],
      variablesSearchText: '',
      addVariableName: '',
      canEdit: false,
      canAddColorVariable: false,
      canAddContrastVariable: false,
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
    viewModelMocks.useMappingsCardViewModel.mockReturnValueOnce({
      template,
      mappingsByType: { theme: [], 'textmate token': [], 'semantic token': [] },
      groups: [],
      colorVariables: [],
      contrastVariables: [],
      orphanKeys: new Set<string>(),
      canEdit: false,
      mappingSearchText: '',
      mappingColorVariableFilter: [],
      mappingContrastVariableFilter: [],
      onUpdateGroupRef: vi.fn(),
      onUpdateColorRef: vi.fn(),
      onUpdateContrastRef: vi.fn(),
      semanticVariant: undefined,
      onRemoveMapping: vi.fn(),
      setMappingSearchText: vi.fn(),
      setMappingColorVariableFilter: vi.fn(),
      setMappingContrastVariableFilter: vi.fn(),
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
      onRemoveMapping: vi.fn(),
      setMappingSearchText: vi.fn(),
      setMappingColorVariableFilter: vi.fn(),
      setMappingContrastVariableFilter: vi.fn(),
      semanticVariant: {
        semanticTokenModifiers: ['readonly'],
        semanticTokenLanguages: ['typescript'],
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
      variablesSearchText: '',
      addVariableName: 'accent',
      canEdit: true,
      canAddColorVariable: true,
      canAddContrastVariable: true,
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
      groups: template.groups,
      colorVariables: template.colorVariables,
      contrastVariables: template.contrastVariables,
      orphanKeys: new Set<string>(),
      canEdit: true,
      mappingSearchText: 'editor',
      mappingColorVariableFilter: [],
      mappingContrastVariableFilter: [],
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
    const recordUndoEntry = new RecordUndoEntryOperation(undoStackStore);
    const setCurrentUndoStackId = new SetCurrentUndoStackIdOperation(undoStackStore);
    const addVariable = new AddColorVariableController(
      templatesStore,
      templateUiStore,
      catalogUiStore,
      themeUiStore,
      new BumpTemplateVersionForEditOperation(),
      new AddColorVariableOperation(),
      saveTemplate as never,
      refreshTemplateRefsAndSelect as never,
      recordUndoEntry,
      setCurrentUndoStackId,
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
      recordUndoEntry,
      setCurrentUndoStackId,
    );

    await addVariable.run('editorFg');
    await addGroup.run('core');
    expect(templatesStore.getStore().state.templates['template-a']?.['1.0.0']?.template?.groups).toEqual(['core']);
    expect(undoStackStore.getStore().state.undoMenu.frames).toHaveLength(3);

    await new UndoOperation(undoStackStore).execute();
    expect(templatesStore.getStore().state.templates['template-a']?.['1.0.0']?.template?.groups).toEqual([]);

    await new RedoOperation(undoStackStore).execute();
    expect(templatesStore.getStore().state.templates['template-a']?.['1.0.0']?.template?.groups).toEqual(['core']);
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
    const addVariable = new AddColorVariableController(
      templatesStore,
      templateUiStore,
      new CatalogUiStore(),
      new ThemeUiStore(),
      new BumpTemplateVersionForEditOperation(),
      new AddColorVariableOperation(),
      saveTemplate as never,
      { execute: vi.fn() } as never,
      new RecordUndoEntryOperation(undoStackStore),
      new SetCurrentUndoStackIdOperation(undoStackStore),
    );
    const addGroup = new AddGroupController(
      templatesStore,
      templateUiStore,
      new CatalogUiStore(),
      new ThemeUiStore(),
      new BumpTemplateVersionForEditOperation(),
      new AddGroupToTemplateOperation(),
      saveTemplate as never,
      { execute: vi.fn() } as never,
      new RecordUndoEntryOperation(undoStackStore),
      new SetCurrentUndoStackIdOperation(undoStackStore),
    );

    await addVariable.run('editorFg');
    await addVariable.run('   ');
    await addGroup.run('core');
    await addGroup.run('   ');

    expect(saveTemplate.execute).not.toHaveBeenCalled();
    expect(undoStackStore.getStore().state.undoMenu.canUndo).toBe(false);
  });
});
