import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ThemesPage } from './theme-page/ThemesPage';
import { CreateThemeDialog } from './create-theme-dialog/CreateThemeDialog';
import { ThemesCard } from './themes-card/ThemesCard';
import { ThemeDetailsCard } from './theme-details-card/ThemeDetailsCard';
import { ThemePaletteCard } from './theme-palette-card/ThemePaletteCard';
import { ThemeVariablesCard } from './theme-variables-card/ThemeVariablesCard';
import { EditorPreviewsCard } from './editor-previews-card/EditorPreviewsCard';
import { undoManagerV2 } from '../../domain/core/undo-manager-v2';
import { SetColorVariableDarkOperation } from '../../domain/operations/theme-operations/theme-details/set-color-variable-dark-operation';
import { RecordUndoEntryOperation } from '../../domain/operations/undo-operations/record-undo-entry-operation';
import { RedoOperation } from '../../domain/operations/undo-operations/redo-operation';
import { HistoryGoToOperation } from '../../domain/operations/undo-operations/history-go-to-operation';
import { SetCurrentUndoStackIdOperation } from '../../domain/operations/undo-operations/set-current-undo-stack-id-operation';
import { UndoOperation } from '../../domain/operations/undo-operations/undo-operation';
import { ThemesStore } from '../../domain/state/data/themes-store';
import { ThemeUiStore } from '../../domain/state/ui/theme-ui-store';
import { UndoStackStore } from '../../domain/state/undo-stack/undo-stack-store';
import { SetColorVariableDarkController } from './theme-variables-card/controllers/set-color-variable-dark-controller';
import { AssignColorFromPickerController } from './theme-palette-card/controllers/assign-color-from-picker-controller';
import { SelectThemeAndLoadController } from './themes-card/controllers/select-theme-and-load-controller';
import { themeSchema } from '../../model/schema/theme-schemas';
import { CommitAssignColorTextOperation } from '../../domain/operations/theme-operations/palette-color-assign/commit-assign-color-text-operation';
import { CatalogUiStore } from '../../domain/state/ui/catalog-ui-store';
import { TemplateUiStore } from '../../domain/state/ui/template-ui-store';

const viewModelMocks = vi.hoisted(() => ({
  useThemeViewModel: vi.fn(),
  useThemesPageChromeViewModel: vi.fn(),
  useCreateThemeDialogViewModel: vi.fn(),
  useThemesCardViewModel: vi.fn(),
  useThemeDetailsCardViewModel: vi.fn(),
  useThemePaletteCardViewModel: vi.fn(),
  useThemeVariablesCardViewModel: vi.fn(),
  useEditorPreviewsCardViewModel: vi.fn(),
}));

vi.mock('./theme-page/use-theme-viewmodel', () => ({
  useThemeViewModel: viewModelMocks.useThemeViewModel,
}));

vi.mock('./theme-page/use-themes-page-chrome-viewmodel', () => ({
  useThemesPageChromeViewModel: viewModelMocks.useThemesPageChromeViewModel,
}));

vi.mock('./create-theme-dialog/use-create-theme-dialog-viewmodel', () => ({
  useCreateThemeDialogViewModel: viewModelMocks.useCreateThemeDialogViewModel,
}));

vi.mock('./themes-card/use-themes-card-viewmodel', () => ({
  useThemesCardViewModel: viewModelMocks.useThemesCardViewModel,
}));

vi.mock('./theme-details-card/use-theme-details-card-viewmodel', () => ({
  useThemeDetailsCardViewModel: viewModelMocks.useThemeDetailsCardViewModel,
}));

vi.mock('./theme-palette-card/use-theme-palette-card-viewmodel', () => ({
  useThemePaletteCardViewModel: viewModelMocks.useThemePaletteCardViewModel,
}));

vi.mock('./theme-variables-card/use-theme-variables-card-viewmodel', () => ({
  useThemeVariablesCardViewModel: viewModelMocks.useThemeVariablesCardViewModel,
}));

vi.mock('./editor-previews-card/use-editor-previews-card-viewmodel', () => ({
  useEditorPreviewsCardViewModel: viewModelMocks.useEditorPreviewsCardViewModel,
}));

vi.mock('./editor-previews-card/LazyEditorPreviewsCard', () => ({
  LazyEditorPreviewsCard: () => <div>LazyEditorPreviewsCard</div>,
}));

vi.mock('./theme-palette-card/ThemePaletteClusterColumn', () => ({
  ThemePaletteClusterColumn: ({
    cluster,
    refsInGroupSet,
    handleSwatchClick,
  }: {
    cluster: string[];
    refsInGroupSet: ReadonlySet<string>;
    handleSwatchClick: (hex: string, refsInGroup: ReadonlySet<string>) => void;
  }) => (
    <button
      type="button"
      onClick={() => handleSwatchClick(cluster[0] ?? '#000000', refsInGroupSet)}
    >
      Cluster {cluster[0] ?? 'empty'}
    </button>
  ),
}));

describe('theme renderer workflows', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    viewModelMocks.useThemesPageChromeViewModel.mockReturnValue({
      saveError: null,
      createDialogOpen: false,
      onDismissSaveErrorClick: vi.fn(),
    });
    viewModelMocks.useCreateThemeDialogViewModel.mockReturnValue({
      name: '',
      canSubmit: false,
      showNameError: false,
      onOkClick: vi.fn(),
      onCancelClick: vi.fn(),
      onNameChange: vi.fn(),
    });
    viewModelMocks.useThemesCardViewModel.mockReturnValue({
      themeNames: [],
      selectedName: null,
      versionsForSelectedName: [],
      selectedRef: null,
      onSelectName: vi.fn(),
      onSelectVersion: vi.fn(),
      onCreateClick: vi.fn(),
      isCreating: false,
    });
    viewModelMocks.useThemeDetailsCardViewModel.mockReturnValue({
      theme: null,
      templateNamesList: [],
      versionsForSelectedTemplate: [],
      selectedTemplateName: null,
      selectedTemplateVersion: null,
      canGenerate: false,
      generateButtonTitle: 'Select a template',
      generateResult: null,
      onDeleteVersionClick: vi.fn(),
      onGenerateClick: vi.fn(),
      onBumpVersionClick: vi.fn(),
      onTemplateChange: vi.fn(),
      onTemplateVersionChange: vi.fn(),
    });
    viewModelMocks.useThemePaletteCardViewModel.mockReturnValue({
      theme: null,
      hueAdjustment: 0,
      hueReferenceHex: '#ff0000',
      onHueChange: vi.fn(),
      onHueReferenceChange: vi.fn(),
      onRecenter: vi.fn(),
      onHueDragStart: vi.fn(),
      onHueDragEnd: vi.fn(),
      applyToDark: true,
      applyToLight: true,
      onApplyToDarkChange: vi.fn(),
      onApplyToLightChange: vi.fn(),
      clusterCountK: 3,
      onClusterCountDelta: vi.fn(),
      onClusterCountCommit: vi.fn(),
      colorAssignments: [],
      colorVariables: [],
      groups: [],
      checkedColorRefs: new Set<string>(),
      onSetColorGroupChecked: vi.fn(),
      onSetColorRefsChecked: vi.fn(),
      selectedColorsDisplay: { kind: 'none' },
      onSetSelectedColors: vi.fn(),
      onColorPickerOpen: vi.fn(),
      onSetSelectedColorsPreview: vi.fn(),
      onColorPickerClose: vi.fn(),
      onHueReferenceEyedropperClick: vi.fn(),
      onAssignEyedropperClick: vi.fn(),
    });
    viewModelMocks.useThemeVariablesCardViewModel.mockReturnValue({
      theme: null,
      colorAssignments: [],
      contrastAssignments: [],
      colorVariables: [],
      contrastVariables: [],
      orphanColorKeys: new Set<string>(),
      orphanContrastKeys: new Set<string>(),
      checkedColorRefs: new Set<string>(),
      checkedContrastRefs: new Set<string>(),
      onToggleColorChecked: vi.fn(),
      onToggleContrastChecked: vi.fn(),
      onSetAllColorChecked: vi.fn(),
      onSetAllContrastChecked: vi.fn(),
      onSetAllVariablesChecked: vi.fn(),
      onSetColorGroupChecked: vi.fn(),
      onSetContrastGroupChecked: vi.fn(),
      colorSectionState: 'none',
      contrastSectionState: 'none',
      cardState: 'none',
      onUpdateColorDark: vi.fn(),
      onUpdateColorLight: vi.fn(),
      onUpdateColorUseDark: vi.fn(),
      onUpdateContrastDark: vi.fn(),
      onUpdateContrastLight: vi.fn(),
      onUpdateContrastUseDark: vi.fn(),
      onColorDarkEyedropperClick: vi.fn(),
      onColorLightEyedropperClick: vi.fn(),
      searchValue: '',
      onSearchChange: vi.fn(),
    });
    viewModelMocks.useEditorPreviewsCardViewModel.mockReturnValue({
      theme: null,
      editorPreviews: [],
      colorAssignments: [],
      contrastAssignments: [],
      contrastVariables: [],
      mappings: [],
      idePrimaryTokenRef: null,
      onChangeIdePrimaryTokenRef: vi.fn(),
      ideForegroundTokenRef: null,
      onChangeIdeForegroundTokenRef: vi.fn(),
      themeBackgroundTokenRef: null,
      onChangeThemeBackgroundTokenRef: vi.fn(),
      themeForegroundTokenRef: null,
      onChangeThemeForegroundTokenRef: vi.fn(),
      lineNumberBackgroundTokenRef: null,
      onChangeLineNumberBackgroundTokenRef: vi.fn(),
      lineNumberForegroundTokenRef: null,
      onChangeLineNumberForegroundTokenRef: vi.fn(),
      ideTabTokenRef: null,
      onChangeIdeTabTokenRef: vi.fn(),
      ideTabBarBackgroundTokenRef: null,
      onChangeIdeTabBarBackgroundTokenRef: vi.fn(),
      ideTabBarForegroundTokenRef: null,
      onChangeIdeTabBarForegroundTokenRef: vi.fn(),
      editorPreviewScrollbarBackgroundTokenRef: null,
      onChangeEditorPreviewScrollbarBackgroundTokenRef: vi.fn(),
      editorPreviewScrollbarForegroundTokenRef: null,
      onChangeEditorPreviewScrollbarForegroundTokenRef: vi.fn(),
      editorPreviewSelectionBackgroundTokenRef: null,
      onChangeEditorPreviewSelectionBackgroundTokenRef: vi.fn(),
      editorPreviewMenuForegroundTokenRef: null,
      onChangeEditorPreviewMenuForegroundTokenRef: vi.fn(),
      editorPreviewMenuBackgroundTokenRef: null,
      onChangeEditorPreviewMenuBackgroundTokenRef: vi.fn(),
    });
  });

  it('renders theme page loading, save-error, and create-dialog states', () => {
    viewModelMocks.useThemeViewModel.mockReturnValueOnce({
      isPageLoading: true,
      isThemeLoading: false,
      isThemeLoaded: false,
    });

    const view = render(<ThemesPage />);
    expect(view.getByText('Loading themes...')).toBeInTheDocument();

    const onDismissSaveErrorClick = vi.fn();
    viewModelMocks.useThemeViewModel.mockReturnValueOnce({
      isPageLoading: false,
      isThemeLoading: true,
      isThemeLoaded: false,
    });
    viewModelMocks.useThemesPageChromeViewModel.mockReturnValueOnce({
      saveError: 'Autosave failed',
      createDialogOpen: true,
      onDismissSaveErrorClick,
    });
    view.rerender(<ThemesPage />);

    expect(view.getByRole('alert')).toHaveTextContent('Autosave failed');
    expect(view.getByText('Loading theme...')).toBeInTheDocument();
    expect(view.getByRole('heading', { name: 'Create New Theme' })).toBeInTheDocument();

    const dismissButtons = view.getAllByRole('button', { name: 'Dismiss' });
    dismissButtons[0].click();
    expect(onDismissSaveErrorClick).toHaveBeenCalledTimes(1);
  });

  it('handles theme dialog, selection, and detail interactions', async () => {
    const user = userEvent.setup();
    const createCallbacks = {
      onOkClick: vi.fn(),
      onCancelClick: vi.fn(),
      onNameChange: vi.fn(),
    };
    const themesCallbacks = {
      onSelectName: vi.fn(),
      onSelectVersion: vi.fn(),
      onCreateClick: vi.fn(),
    };
    const detailCallbacks = {
      onDeleteVersionClick: vi.fn(),
      onGenerateClick: vi.fn(),
      onBumpVersionClick: vi.fn(),
      onTemplateChange: vi.fn(),
      onTemplateVersionChange: vi.fn(),
    };

    viewModelMocks.useCreateThemeDialogViewModel.mockReturnValue({
      name: 'starter',
      canSubmit: false,
      showNameError: true,
      ...createCallbacks,
    });
    viewModelMocks.useThemesCardViewModel.mockReturnValue({
      themeNames: ['theme-a', 'theme-b'],
      selectedName: 'theme-a',
      versionsForSelectedName: [{ version: '1.0.0' }, { version: '1.0.1' }],
      selectedRef: { version: '1.0.1' },
      isCreating: false,
      ...themesCallbacks,
    });
    viewModelMocks.useThemeDetailsCardViewModel.mockReturnValue({
      theme: {
        name: 'theme-a',
        version: '1.0.1',
        templateRef: { name: 'template-a', version: '1.0.0' },
        colorAssignments: [{ colorRef: 'editorFg', dark: { value: '#112233' }, light: { value: '#445566' }, useDarkForLight: false }],
        contrastAssignments: [],
      },
      templateNamesList: ['template-a', 'template-b'],
      versionsForSelectedTemplate: [{ version: '1.0.0' }, { version: '1.0.1' }],
      selectedTemplateName: 'template-a',
      selectedTemplateVersion: '1.0.1',
      canGenerate: true,
      generateButtonTitle: 'Generate exports',
      generateResult: { success: true, message: 'Generated successfully' },
      ...detailCallbacks,
    });

    const dialog = render(<CreateThemeDialog />);
    await user.type(dialog.getByPlaceholderText('my-theme'), 'x');
    expect(createCallbacks.onNameChange).toHaveBeenLastCalledWith('starterx');
    await user.click(dialog.getByRole('button', { name: 'Cancel' }));
    expect(createCallbacks.onCancelClick).toHaveBeenCalledTimes(1);
    dialog.unmount();

    const card = render(<ThemesCard />);
    const selects = card.getAllByRole('combobox');
    await user.selectOptions(selects[0], 'theme-b');
    await user.selectOptions(selects[1], '1.0.0');
    await user.click(card.getByRole('button', { name: 'Create new theme' }));
    expect(themesCallbacks.onSelectName).toHaveBeenCalledWith('theme-b');
    expect(themesCallbacks.onSelectVersion).toHaveBeenCalledWith('1.0.0');
    expect(themesCallbacks.onCreateClick).toHaveBeenCalledTimes(1);
    card.unmount();

    const details = render(<ThemeDetailsCard />);
    const detailSelects = details.getAllByRole('combobox');
    await user.selectOptions(detailSelects[0], 'template-b');
    await user.selectOptions(detailSelects[1], '1.0.0');
    await user.click(details.getByRole('button', { name: 'Delete version' }));
    await user.click(details.getByRole('button', { name: 'Increment Version' }));
    await user.click(details.getByRole('button', { name: 'Generate' }));
    expect(detailCallbacks.onTemplateChange).toHaveBeenCalledWith('template-b');
    expect(detailCallbacks.onTemplateVersionChange).toHaveBeenCalledWith('1.0.0');
    expect(detailCallbacks.onDeleteVersionClick).toHaveBeenCalledTimes(1);
    expect(detailCallbacks.onBumpVersionClick).toHaveBeenCalledTimes(1);
    expect(detailCallbacks.onGenerateClick).toHaveBeenCalledTimes(1);
    expect(details.getByRole('status')).toHaveTextContent('Generated successfully');
    details.unmount();
  });

  it('supports palette, variable, and preview renderer interactions', async () => {
    const user = userEvent.setup();
    const paletteCallbacks = {
      onHueChange: vi.fn(),
      onHueReferenceChange: vi.fn(),
      onRecenter: vi.fn(),
      onHueDragStart: vi.fn(),
      onHueDragEnd: vi.fn(),
      onApplyToDarkChange: vi.fn(),
      onApplyToLightChange: vi.fn(),
      onClusterCountDelta: vi.fn(),
      onClusterCountCommit: vi.fn(),
      onSetColorGroupChecked: vi.fn(),
      onSetColorRefsChecked: vi.fn(),
      onSetSelectedColors: vi.fn(),
      onColorPickerOpen: vi.fn(() => ({ kind: 'dark' })),
      onSetSelectedColorsPreview: vi.fn(),
      onColorPickerClose: vi.fn(),
      onHueReferenceEyedropperClick: vi.fn(),
      onAssignEyedropperClick: vi.fn(),
    };
    const variableCallbacks = {
      onToggleColorChecked: vi.fn(),
      onToggleContrastChecked: vi.fn(),
      onSetAllColorChecked: vi.fn(),
      onSetAllContrastChecked: vi.fn(),
      onSetAllVariablesChecked: vi.fn(),
      onSetColorGroupChecked: vi.fn(),
      onSetContrastGroupChecked: vi.fn(),
      onUpdateColorDark: vi.fn(),
      onUpdateColorLight: vi.fn(),
      onUpdateColorUseDark: vi.fn(),
      onUpdateContrastDark: vi.fn(),
      onUpdateContrastLight: vi.fn(),
      onUpdateContrastUseDark: vi.fn(),
      onColorDarkEyedropperClick: vi.fn(),
      onColorLightEyedropperClick: vi.fn(),
      onSearchChange: vi.fn(),
    };
    const previewCallbacks = {
      onChangeIdePrimaryTokenRef: vi.fn(),
      onChangeIdeForegroundTokenRef: vi.fn(),
      onChangeThemeBackgroundTokenRef: vi.fn(),
      onChangeThemeForegroundTokenRef: vi.fn(),
      onChangeLineNumberBackgroundTokenRef: vi.fn(),
      onChangeLineNumberForegroundTokenRef: vi.fn(),
      onChangeIdeTabTokenRef: vi.fn(),
      onChangeIdeTabBarBackgroundTokenRef: vi.fn(),
      onChangeIdeTabBarForegroundTokenRef: vi.fn(),
      onChangeEditorPreviewScrollbarBackgroundTokenRef: vi.fn(),
      onChangeEditorPreviewScrollbarForegroundTokenRef: vi.fn(),
      onChangeEditorPreviewSelectionBackgroundTokenRef: vi.fn(),
      onChangeEditorPreviewMenuForegroundTokenRef: vi.fn(),
      onChangeEditorPreviewMenuBackgroundTokenRef: vi.fn(),
    };

    viewModelMocks.useThemePaletteCardViewModel.mockReturnValue({
      theme: { templateRef: { name: 'template-a', version: '1.0.0' } },
      hueAdjustment: 5,
      hueReferenceHex: '#ff0000',
      applyToDark: true,
      applyToLight: false,
      clusterCountK: 4,
      colorAssignments: [
        { colorRef: 'editorFg', dark: { value: '#112233' }, light: { value: '#445566' }, useDarkForLight: false },
      ],
      colorVariables: [{ key: 'editorFg', groupRef: 'core' }],
      groups: ['core'],
      checkedColorRefs: new Set<string>(['editorFg']),
      selectedColorsDisplay: { kind: 'single', hex: '#112233' },
      ...paletteCallbacks,
    });
    viewModelMocks.useThemeVariablesCardViewModel.mockReturnValue({
      theme: { templateRef: { name: 'template-a', version: '1.0.0' } },
      colorAssignments: [
        { colorRef: 'editorFg', dark: { value: '#112233' }, light: { value: '#445566' }, useDarkForLight: false },
      ],
      contrastAssignments: [
        { contrastVariableRef: 'editorContrast', dark: { value: 4.5, comparisonMethod: 'greaterThan', min: 3, max: 7 }, light: { value: 3, comparisonMethod: 'equalTo', min: null, max: null }, useDarkForLight: false },
      ],
      colorVariables: [{ key: 'editorFg', groupRef: 'core' }],
      contrastVariables: [{ key: 'editorContrast', comparisonSourceRef: 'editorFg', groupRef: 'core' }],
      orphanColorKeys: new Set<string>(),
      orphanContrastKeys: new Set<string>(),
      checkedColorRefs: new Set<string>(['editorFg']),
      checkedContrastRefs: new Set<string>(['editorContrast']),
      colorSectionState: 'all',
      contrastSectionState: 'all',
      cardState: 'all',
      searchValue: '',
      ...variableCallbacks,
    });
    viewModelMocks.useEditorPreviewsCardViewModel.mockReturnValue({
      theme: { templateRef: { name: 'template-a', version: '1.0.0' } },
      editorPreviews: [
        { language: 'typescript', fileName: 'example.ts', lines: [{ tokens: [{ text: 'const', scopes: ['keyword.control'] }] }] },
        { language: 'json', fileName: 'example.json', lines: [{ tokens: [{ text: '"k"', scopes: ['string.quoted'] }] }] },
      ],
      colorAssignments: [
        { colorRef: 'editorFg', dark: { value: '#112233' }, light: { value: '#445566' }, useDarkForLight: false },
      ],
      contrastAssignments: [],
      contrastVariables: [],
      mappings: [
        { token: { key: 'editor.foreground', type: 'theme' }, colorVariableRef: 'editorFg', contrastVariableRef: null, groupRef: null },
      ],
      idePrimaryTokenRef: 'editor.foreground',
      ideForegroundTokenRef: 'editor.foreground',
      themeBackgroundTokenRef: 'editor.foreground',
      themeForegroundTokenRef: 'editor.foreground',
      lineNumberBackgroundTokenRef: 'editor.foreground',
      lineNumberForegroundTokenRef: 'editor.foreground',
      ideTabTokenRef: 'editor.foreground',
      ideTabBarBackgroundTokenRef: 'editor.foreground',
      ideTabBarForegroundTokenRef: 'editor.foreground',
      editorPreviewScrollbarBackgroundTokenRef: 'editor.foreground',
      editorPreviewScrollbarForegroundTokenRef: 'editor.foreground',
      editorPreviewSelectionBackgroundTokenRef: 'editor.foreground',
      editorPreviewMenuForegroundTokenRef: 'editor.foreground',
      editorPreviewMenuBackgroundTokenRef: 'editor.foreground',
      ...previewCallbacks,
    });

    const palette = render(<ThemePaletteCard />);
    const paletteCheckboxes = palette.getAllByRole('checkbox');
    await user.click(paletteCheckboxes[0]);
    await user.click(paletteCheckboxes[1]);
    await user.click(palette.getByRole('button', { name: 'Recenter hue slider to 0' }));
    const hueRefInput = palette.getByRole('textbox', { name: 'Hue reference color (hex)' });
    await user.clear(hueRefInput);
    await user.type(hueRefInput, '#00ff00');
    await user.click(palette.getByRole('button', { name: 'Pick hue reference color from screen' }));
    await user.click(palette.getByRole('button', { name: /open color picker for selected variables/i }));
    await user.click(palette.getByRole('button', { name: /pick color from screen/i }));
    await user.click(palette.getByRole('checkbox', { name: 'Select all in group: core' }));
    expect(paletteCallbacks.onApplyToDarkChange).toHaveBeenCalled();
    expect(paletteCallbacks.onApplyToLightChange).toHaveBeenCalled();
    expect(paletteCallbacks.onRecenter).toHaveBeenCalledTimes(1);
    expect(paletteCallbacks.onHueReferenceEyedropperClick).toHaveBeenCalledTimes(1);
    expect(paletteCallbacks.onAssignEyedropperClick).toHaveBeenCalledTimes(1);
    expect(paletteCallbacks.onSetColorGroupChecked).toHaveBeenCalledWith('core', false);
    palette.unmount();

    const variables = render(<ThemeVariablesCard />);
    await user.type(variables.getByRole('textbox', { name: 'Search variables' }), 'editor');
    const variableCheckboxes = variables.getAllByRole('checkbox');
    await user.click(variableCheckboxes[0]);
    const colorInputs = variables.getAllByPlaceholderText(/#(?:000000|ffffff)/);
    await user.clear(colorInputs[0]);
    await user.type(colorInputs[0], '#abcdef');
    colorInputs[0].blur();
    await user.click(variables.getByRole('button', { name: 'Pick dark color from screen' }));
    await user.click(variables.getAllByRole('checkbox', { name: 'Use dark value for light theme' })[0]);
    const contrastValue = variables.getAllByPlaceholderText('Value')[0];
    await user.clear(contrastValue);
    await user.type(contrastValue, '7');
    contrastValue.blur();
    expect(variableCallbacks.onSearchChange).toHaveBeenCalled();
    expect(variableCallbacks.onSetAllVariablesChecked).toHaveBeenCalled();
    expect(variableCallbacks.onUpdateColorDark).toHaveBeenCalledWith('editorFg', '#abcdef');
    expect(variableCallbacks.onColorDarkEyedropperClick).toHaveBeenCalledWith('editorFg');
    expect(variableCallbacks.onUpdateColorUseDark).toHaveBeenCalledWith('editorFg', true);
    expect(variableCallbacks.onUpdateContrastDark).toHaveBeenCalledWith('editorContrast', 'value', 7);
    variables.unmount();

    const previews = render(<EditorPreviewsCard />);
    await user.click(previews.getByRole('button', { name: 'IDE Foreground' }));
    await user.type(previews.getByRole('textbox', { name: 'Filter tokens' }), 'editor');
    await user.click(previews.getAllByRole('option', { name: 'editor.foreground' })[0]);
    await user.click(previews.getAllByRole('button', { name: 'Show sample list' })[0]);
    await user.click(previews.getAllByRole('option', { name: 'json' })[0]);
    expect(previewCallbacks.onChangeIdeForegroundTokenRef).toHaveBeenCalledWith('editor.foreground');
    expect(previews.getByText('Dark')).toBeInTheDocument();
    expect(previews.getByText('Light')).toBeInTheDocument();
  });

  it('records, undoes, and redoes a completed theme dark color edit', async () => {
    await undoManagerV2.clearPersisted();
    const themeUiStore = new ThemeUiStore();
    const themesStore = new ThemesStore();
    const undoStackStore = new UndoStackStore();
    const debouncedThemePersist = {
      schedule: vi.fn((saveTheme: () => Promise<void> | void) => {
        void saveTheme();
      }),
    };
    const themeGateway = {
      saveTheme: vi.fn(),
    };
    const setColorVariableDark = new SetColorVariableDarkOperation(
      themeUiStore,
      themesStore,
      debouncedThemePersist as never,
      themeGateway as never,
    );
    const controller = new SetColorVariableDarkController(
      themeUiStore,
      setColorVariableDark,
      new RecordUndoEntryOperation(undoStackStore),
      new SetCurrentUndoStackIdOperation(undoStackStore),
    );
    const undo = new UndoOperation(undoStackStore);
    const redo = new RedoOperation(undoStackStore);

    themeUiStore.getStore().setSelectedRef({ name: 'theme-a', version: '1.0.0' });
    themeUiStore.getStore().setTheme(themeSchema.parse({
      name: 'theme-a',
      version: '1.0.0',
      templateRef: { name: 'template-a', version: '1.0.0' },
      colorAssignments: [
        { colorRef: 'editorFg', dark: { value: '#111111' }, light: { value: '#eeeeee' }, useDarkForLight: false },
      ],
      contrastAssignments: [],
    }));

    await controller.run('editorFg', '#222222');
    expect(themeUiStore.getStore().state.theme?.colorAssignments[0].dark?.value).toBe('#222222');
    expect(undoStackStore.getStore().state.undoMenu).toMatchObject({
      canUndo: true,
      nextUndoDescription: 'Change editorFg dark color',
    });

    await undo.execute();
    expect(themeUiStore.getStore().state.theme?.colorAssignments[0].dark?.value).toBe('#111111');

    await redo.execute();
    expect(themeUiStore.getStore().state.theme?.colorAssignments[0].dark?.value).toBe('#222222');
  });

  it('navigates theme edit history to the state immediately before a selected item', async () => {
    await undoManagerV2.clearPersisted();
    const themeUiStore = new ThemeUiStore();
    const themesStore = new ThemesStore();
    const undoStackStore = new UndoStackStore();
    const setColorVariableDark = new SetColorVariableDarkOperation(
      themeUiStore,
      themesStore,
      { schedule: vi.fn((saveTheme: () => Promise<void> | void) => void saveTheme()) } as never,
      { saveTheme: vi.fn() } as never,
    );
    const controller = new SetColorVariableDarkController(
      themeUiStore,
      setColorVariableDark,
      new RecordUndoEntryOperation(undoStackStore),
      new SetCurrentUndoStackIdOperation(undoStackStore),
    );
    const goTo = new HistoryGoToOperation(undoStackStore);

    themeUiStore.getStore().setSelectedRef({ name: 'theme-a', version: '1.0.0' });
    themeUiStore.getStore().setTheme(themeSchema.parse({
      name: 'theme-a',
      version: '1.0.0',
      templateRef: { name: 'template-a', version: '1.0.0' },
      colorAssignments: [
        { colorRef: 'editorFg', dark: { value: '#111111' }, light: { value: '#eeeeee' }, useDarkForLight: false },
      ],
      contrastAssignments: [],
    }));

    await controller.run('editorFg', '#222222');
    await controller.run('editorFg', '#333333');
    const secondEntryId = undoStackStore.getStore().state.undoMenu.frames[1].id;

    await expect(goTo.execute(secondEntryId)).resolves.toMatchObject({
      status: 'transitioned',
      mode: 'go-to',
      entryId: secondEntryId,
    });

    expect(themeUiStore.getStore().state.theme?.colorAssignments[0].dark?.value).toBe('#222222');
    expect(undoStackStore.getStore().state.undoMenu.currentId).toBe(
      undoStackStore.getStore().state.undoMenu.frames[0].id,
    );
    expect(undoStackStore.getStore().state.undoMenu.canRedo).toBe(true);
  });

  it('selects a theme-scoped undo stack when theme references change', async () => {
    const themeUiStore = {
      getStore: () => ({
        state: {
          theme: {
            name: 'theme-b',
            version: '3.0.0',
            templateRef: { name: 'theme-template', version: '1.0.0' },
          },
        },
      }),
    };
    const loadThemeThen = vi.fn(async (_label: string, onLoaded: () => Promise<void>) => {
      await onLoaded();
    });
    const loadTheme = { execute: vi.fn(() => ({ then: loadThemeThen })) };
    const setCurrentUndoStackId = { executeAndLoadForContext: vi.fn() };
    const controller = new SelectThemeAndLoadController(
      themeUiStore as never,
      { execute: vi.fn() } as never,
      loadTheme as never,
      { execute: vi.fn() } as never,
      { execute: vi.fn(async () => null) } as never,
      { execute: vi.fn() } as never,
      { execute: vi.fn() } as never,
      { getStore: () => ({ state: { selectedRef: { name: 'catalog-a', version: '2.0.0' } } }) } as never,
      { getStore: () => ({ state: { selectedRef: { name: 'template-a', version: '1.0.0' } } }) } as never,
      setCurrentUndoStackId as never,
    );

    await controller.run('theme-a', '3.0.0');

    expect(setCurrentUndoStackId.executeAndLoadForContext).toHaveBeenNthCalledWith(1, expect.objectContaining({
      contextKey: 'tab=themes|template=template-a@1.0.0|catalog=catalog-a@2.0.0|theme=theme-a@3.0.0',
    }));
    expect(setCurrentUndoStackId.executeAndLoadForContext).toHaveBeenNthCalledWith(2, expect.objectContaining({
      contextKey: 'tab=themes|template=theme-template@1.0.0|catalog=catalog-a@2.0.0|theme=theme-a@3.0.0',
    }));
  });

  it('records palette color assignments and skips rejected palette commits', async () => {
    await undoManagerV2.clearPersisted();
    const themeUiStore = new ThemeUiStore();
    const themesStore = new ThemesStore();
    const undoStackStore = new UndoStackStore();
    const saveTheme = vi.fn();
    const commitAssignColorText = new CommitAssignColorTextOperation(
      themeUiStore,
      themesStore,
      { schedule: vi.fn((save: () => Promise<void> | void) => void save()) } as never,
      { saveTheme } as never,
    );
    const controller = new AssignColorFromPickerController(
      commitAssignColorText,
      themeUiStore,
      new CatalogUiStore(),
      new TemplateUiStore(),
      new RecordUndoEntryOperation(undoStackStore),
      new SetCurrentUndoStackIdOperation(undoStackStore),
    );
    themeUiStore.getStore().setSelectedRef({ name: 'theme-a', version: '1.0.0' });
    themeUiStore.getStore().setTheme(themeSchema.parse({
      name: 'theme-a',
      version: '1.0.0',
      templateRef: { name: 'template-a', version: '1.0.0' },
      colorAssignments: [
        { colorRef: 'editorFg', dark: { value: '#111111' }, light: { value: '#eeeeee' }, useDarkForLight: false },
      ],
      contrastAssignments: [],
    }));

    await controller.run('#222222');
    expect(saveTheme).not.toHaveBeenCalled();
    expect(undoStackStore.getStore().state.undoMenu.canUndo).toBe(false);

    themeUiStore.getStore().setThemePaneSelections(['editorFg'], []);
    await controller.run('#222222');
    expect(themeUiStore.getStore().state.theme?.colorAssignments[0].dark?.value).toBe('#222222');
    expect(undoStackStore.getStore().state.undoMenu.nextUndoDescription).toBe('Assign palette color');

    await new UndoOperation(undoStackStore).execute();
    expect(themeUiStore.getStore().state.theme?.colorAssignments[0].dark?.value).toBe('#111111');
  });
});
