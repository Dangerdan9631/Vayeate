import { render } from '@testing-library/react';
import * as testingLibraryReact from '@testing-library/react';
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
import { CommitAssignColorTextOperation } from '../../domain/operations/theme-operations/palette-color-assign/commit-assign-color-text-operation';
import { SetAssignColorPreviewOperation } from '../../domain/operations/theme-operations/palette-color-assign/set-assign-color-preview-operation';
import { ApplyThemeStateAndSchedulePersistOperation } from '../../domain/operations/theme-operations/theme-details/apply-theme-state-and-schedule-persist-operation';
import { ApplyThemeStateOperation } from '../../domain/operations/theme-operations/theme-details/apply-theme-state-operation';
import { SetColorVariableDarkOperation } from '../../domain/operations/theme-operations/theme-details/set-color-variable-dark-operation';
import { SetColorUseDarkForLightOperation } from '../../domain/operations/theme-operations/theme-details/set-color-use-dark-for-light-operation';
import { SetContrastUseDarkForLightOperation } from '../../domain/operations/theme-operations/theme-details/set-contrast-use-dark-for-light-operation';
import { SetContrastVariableFieldOperation } from '../../domain/operations/theme-operations/theme-details/set-contrast-variable-field-operation';
import { SetThemeOperation } from '../../domain/operations/theme-operations/theme-details/set-theme-operation';
import { SetThemePaneSelectionsOperation } from '../../domain/operations/theme-operations/pickers/set-theme-pane-selections-operation';
import { ApplyThemeUndoStateOperation } from '../../domain/operations/undo-operations/apply-theme-undo-state-operation';
import { ApplyThemeLifecycleUndoOperation } from '../../domain/operations/undo-operations/apply-theme-lifecycle-undo-operation';
import { RestoreThemePaletteAssignUndoOperation } from '../../domain/operations/undo-operations/restore-theme-palette-assign-undo-operation';
import { SetThemeHueAdjustmentOperation } from '../../domain/operations/theme-operations/palette-hue/set-theme-hue-adjustment-operation';
import { SetThemeSaturationAdjustmentOperation } from '../../domain/operations/theme-operations/palette-hue/set-theme-saturation-adjustment-operation';
import { SetThemeValueAdjustmentOperation } from '../../domain/operations/theme-operations/palette-hue/set-theme-value-adjustment-operation';
import { RecordThemeUndoOperation } from '../../domain/operations/undo-operations/record-theme-undo-operation';
import { RecordUndoEntryOperation } from '../../domain/operations/undo-operations/record-undo-entry-operation';
import {
  createMinimalTestBuildUniversalUndoProcessor,
  createTestBuildUniversalUndoProcessor,
  createTestUndoOperations,
  removeThemeVersion,
  syncContinuation,
  waitForUndoRecorded,
} from '../../../test/undo/test-universal-undo-processor';
import { ThemesStore } from '../../domain/state/data/themes-store';
import { ThemeUiStore } from '../../domain/state/ui/theme-ui-store';
import { ThemeCreateDialogStore } from '../../domain/state/ui/theme-create-dialog-store';
import { UndoStackStore } from '../../domain/state/undo-stack/undo-stack-store';
import { SetColorVariableDarkController } from './theme-variables-card/controllers/set-color-variable-dark-controller';
import { SetContrastVariableDarkValueController } from './theme-variables-card/controllers/set-contrast-variable-dark-value-controller';
import { SetColorUseDarkForLightController } from './theme-variables-card/controllers/set-color-use-dark-for-light-controller';
import { SetContrastUseDarkForLightController } from './theme-variables-card/controllers/set-contrast-use-dark-for-light-controller';
import { ToggleVariableSelectionController } from './theme-variables-card/controllers/toggle-variable-selection-controller';
import { RecenterHueReferenceController } from './theme-palette-card/controllers/recenter-hue-reference-controller';
import { CommitAssignColorEyeDropperController } from './theme-palette-card/controllers/commit-assign-color-eye-dropper-controller';
import { IncrementThemeVersionController } from './theme-details-card/controllers/increment-theme-version-controller';
import { DeleteThemeVersionController } from './theme-details-card/controllers/delete-theme-version-controller';
import { CreateThemeController } from './create-theme-dialog/controllers/create-theme-controller';
import { AssignColorFromPickerController } from './theme-palette-card/controllers/assign-color-from-picker-controller';
import { SelectThemeAndLoadController } from './themes-card/controllers/select-theme-and-load-controller';
import { SelectThemeByNameController } from './themes-card/controllers/select-theme-by-name-controller';
import { deriveUndoContext, UNDO_BASELINE_FRAME_ID } from '../../model/undo-history';
import { themeSchema } from '../../model/schema/theme-schemas';
import { CatalogUiStore } from '../../domain/state/ui/catalog-ui-store';
import { TemplateUiStore } from '../../domain/state/ui/template-ui-store';

const reactTesting = testingLibraryReact as unknown as {
  fireEvent: {
    focus: (element: Element) => boolean;
    input: (element: Element, eventProperties?: unknown) => boolean;
    change: (element: Element, eventProperties?: unknown) => boolean;
    blur: (element: Element) => boolean;
  };
};

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
      title: 'Create New Theme',
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
      onDuplicateClick: vi.fn(),
      isCreating: false,
      canDuplicate: false,
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
      saturationAdjustment: 0,
      valueAdjustment: 0,
      hueReferenceHex: '#ff0000',
      onHueChange: vi.fn(),
      onHueCommit: vi.fn(),
      onSaturationChange: vi.fn(),
      onSaturationCommit: vi.fn(),
      onValueChange: vi.fn(),
      onValueCommit: vi.fn(),
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
      clusterByDark: true,
      onClusterByDarkChange: vi.fn(),
      paletteClustersByGroup: null,
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
      themeTemplateRef: null,
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
      onDuplicateClick: vi.fn(),
    };
    const detailCallbacks = {
      onDeleteVersionClick: vi.fn(),
      onGenerateClick: vi.fn(),
      onBumpVersionClick: vi.fn(),
      onTemplateChange: vi.fn(),
      onTemplateVersionChange: vi.fn(),
    };

    viewModelMocks.useCreateThemeDialogViewModel.mockReturnValue({
      title: 'Create New Theme',
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
      canDuplicate: true,
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
    await user.click(card.getByRole('button', { name: 'Duplicate theme' }));
    expect(themesCallbacks.onSelectName).toHaveBeenCalledWith('theme-b');
    expect(themesCallbacks.onSelectVersion).toHaveBeenCalledWith('1.0.0');
    expect(themesCallbacks.onCreateClick).toHaveBeenCalledTimes(1);
    expect(themesCallbacks.onDuplicateClick).toHaveBeenCalledTimes(1);
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
    const colorPickerSnapshot = { kind: 'dark' };
    const paletteCallbacks = {
      onHueChange: vi.fn(),
      onHueCommit: vi.fn(),
      onSaturationChange: vi.fn(),
      onSaturationCommit: vi.fn(),
      onValueChange: vi.fn(),
      onValueCommit: vi.fn(),
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
      onColorPickerOpen: vi.fn(() => colorPickerSnapshot),
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
      saturationAdjustment: 0,
      valueAdjustment: 0,
      hueReferenceHex: '#ff0000',
      applyToDark: true,
      applyToLight: false,
      clusterCountK: 4,
      clusterByDark: true,
      onClusterByDarkChange: vi.fn(),
      paletteClustersByGroup: {
        core: [{ representative: '#112233', members: [] }],
      },
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
      themeTemplateRef: { name: 'template-a', version: '1.0.0' },
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
    await user.click(palette.getByRole('button', { name: 'Recenter palette adjustment sliders to 0' }));
    const hueRefInput = palette.getByRole('textbox', { name: 'Hue reference color (hex)' });
    await user.clear(hueRefInput);
    await user.type(hueRefInput, '#00ff00');
    await user.click(palette.getByRole('button', { name: 'Pick hue reference color from screen' }));
    await user.click(palette.getByRole('button', { name: /open color picker for selected variables/i }));
    const nativeColorInput = palette.getByLabelText('Color') as HTMLInputElement;
    reactTesting.fireEvent.focus(nativeColorInput);
    reactTesting.fireEvent.input(nativeColorInput, { target: { value: '#abcdef' } });
    reactTesting.fireEvent.change(nativeColorInput, { target: { value: '#abcdef' } });
    reactTesting.fireEvent.change(nativeColorInput, { target: { value: '#fedcba' } });
    reactTesting.fireEvent.blur(nativeColorInput);
    await user.click(palette.getByRole('button', { name: /pick color from screen/i }));
    await user.click(palette.getByRole('checkbox', { name: 'Select all in group: core' }));
    expect(paletteCallbacks.onApplyToDarkChange).toHaveBeenCalled();
    expect(paletteCallbacks.onApplyToLightChange).toHaveBeenCalled();
    expect(paletteCallbacks.onRecenter).toHaveBeenCalledTimes(1);
    expect(paletteCallbacks.onHueReferenceEyedropperClick).toHaveBeenCalledTimes(1);
    expect(paletteCallbacks.onAssignEyedropperClick).toHaveBeenCalledTimes(1);
    expect(paletteCallbacks.onSetColorGroupChecked).toHaveBeenCalledWith('core', false);
    expect(paletteCallbacks.onSetSelectedColorsPreview).toHaveBeenCalledWith('#abcdef');
    expect(paletteCallbacks.onSetSelectedColors).not.toHaveBeenCalledWith('#fedcba');
    expect(paletteCallbacks.onColorPickerClose).toHaveBeenCalledTimes(1);
    expect(paletteCallbacks.onColorPickerClose).toHaveBeenLastCalledWith(colorPickerSnapshot, '#fedcba');
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
      schedule: vi.fn(),
    };
    const setColorVariableDark = new SetColorVariableDarkOperation(
      themeUiStore,
      themesStore,
      debouncedThemePersist as never,
    );
    const applyThemeUndoState = new ApplyThemeUndoStateOperation(
      new SetThemeOperation(themesStore, themeUiStore),
      new ApplyThemeStateAndSchedulePersistOperation(
        new ApplyThemeStateOperation(themeUiStore),
        debouncedThemePersist as never,
        themeUiStore,
      ),
    );
    const testUndo = createTestUndoOperations(
      undoStackStore,
      createTestBuildUniversalUndoProcessor({
        applyCatalogUndoState: { execute: vi.fn() } as never,
        applyTemplateUndoState: { execute: vi.fn() } as never,
        applyThemeUndoState,
        setColorVariableDark,
      }),
    );
    const controller = new SetColorVariableDarkController(
      themeUiStore,
      setColorVariableDark,
      new RecordThemeUndoOperation(
        new RecordUndoEntryOperation(undoStackStore),
        testUndo.buildUniversalUndoProcessor,
      ),
      testUndo.setCurrentUndoStackId,
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

    await controller.run('editorFg', '#222222');
    expect(themeUiStore.getStore().state.theme?.colorAssignments[0].dark?.value).toBe('#222222');
    expect(undoStackStore.getStore().state.undoMenu).toMatchObject({
      canUndo: true,
      nextUndoDescription: 'Change editorFg dark color',
    });

    await testUndo.undo.execute();
    expect(themeUiStore.getStore().state.theme?.colorAssignments[0].dark?.value).toBe('#111111');

    await testUndo.redo.execute();
    expect(themeUiStore.getStore().state.theme?.colorAssignments[0].dark?.value).toBe('#222222');
  });

  it('navigates theme edit history to the state immediately after a selected item', async () => {
    await undoManagerV2.clearPersisted();
    const themeUiStore = new ThemeUiStore();
    const themesStore = new ThemesStore();
    const undoStackStore = new UndoStackStore();
    const debouncedThemePersist = {
      schedule: vi.fn(),
    };
    const setColorVariableDark = new SetColorVariableDarkOperation(
      themeUiStore,
      themesStore,
      debouncedThemePersist as never,
    );
    const testUndo = createTestUndoOperations(
      undoStackStore,
      createTestBuildUniversalUndoProcessor({
        applyCatalogUndoState: { execute: vi.fn() } as never,
        applyTemplateUndoState: { execute: vi.fn() } as never,
        applyThemeUndoState: new ApplyThemeUndoStateOperation(
          new SetThemeOperation(themesStore, themeUiStore),
          new ApplyThemeStateAndSchedulePersistOperation(
            new ApplyThemeStateOperation(themeUiStore),
            debouncedThemePersist as never,
            themeUiStore,
          ),
        ),
        setColorVariableDark,
      }),
    );
    const controller = new SetColorVariableDarkController(
      themeUiStore,
      setColorVariableDark,
      new RecordThemeUndoOperation(
        new RecordUndoEntryOperation(undoStackStore),
        testUndo.buildUniversalUndoProcessor,
      ),
      testUndo.setCurrentUndoStackId,
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

    await controller.run('editorFg', '#222222');
    await controller.run('editorFg', '#333333');
    const firstEntryId = undoStackStore.getStore().state.undoMenu.frames[1].id;
    const secondEntryId = undoStackStore.getStore().state.undoMenu.frames[0].id;

    await expect(testUndo.historyGoTo.execute(firstEntryId)).resolves.toMatchObject({
      status: 'transitioned',
      mode: 'go-to',
      entryId: firstEntryId,
    });

    expect(themeUiStore.getStore().state.theme?.colorAssignments[0].dark?.value).toBe('#222222');
    expect(undoStackStore.getStore().state.undoMenu.currentId).toBe(firstEntryId);
    expect(undoStackStore.getStore().state.undoMenu.canRedo).toBe(true);

    await expect(testUndo.historyGoTo.execute(secondEntryId)).resolves.toMatchObject({
      status: 'transitioned',
      mode: 'go-to',
      entryId: secondEntryId,
    });

    expect(themeUiStore.getStore().state.theme?.colorAssignments[0].dark?.value).toBe('#333333');
    expect(undoStackStore.getStore().state.undoMenu.currentId).toBe(secondEntryId);
    expect(undoStackStore.getStore().state.undoMenu.canRedo).toBe(false);
  });

  it('shows the opened baseline label when a theme context is activated', async () => {
    await undoManagerV2.clearPersisted();
    const undoStackStore = new UndoStackStore();
    const testUndo = createTestUndoOperations(
      undoStackStore,
      createMinimalTestBuildUniversalUndoProcessor(),
    );

    testUndo.setCurrentUndoStackId.executeAndLoadForContext(deriveUndoContext({
      tabId: 'themes',
      themeRef: { name: 'theme-a', version: '3.0.0' },
      templateRef: { name: 'template-a', version: '1.0.0' },
      catalogRef: { name: 'catalog-a', version: '2.0.0' },
    }));
    await testUndo.backgroundQueue.flush();

    expect(undoStackStore.getStore().state.undoMenu.frames.at(-1)).toEqual({
      id: UNDO_BASELINE_FRAME_ID,
      description: 'Opened theme-a@3.0.0',
    });
    expect(undoStackStore.getStore().state.undoMenu.currentId).toBe(UNDO_BASELINE_FRAME_ID);
  });

  it('reverts all theme edits when the opened baseline is selected', async () => {
    await undoManagerV2.clearPersisted();
    const themeUiStore = new ThemeUiStore();
    const themesStore = new ThemesStore();
    const undoStackStore = new UndoStackStore();
    const debouncedThemePersist = {
      schedule: vi.fn(),
    };
    const setColorVariableDark = new SetColorVariableDarkOperation(
      themeUiStore,
      themesStore,
      debouncedThemePersist as never,
    );
    const testUndo = createTestUndoOperations(
      undoStackStore,
      createTestBuildUniversalUndoProcessor({
        applyCatalogUndoState: { execute: vi.fn() } as never,
        applyTemplateUndoState: { execute: vi.fn() } as never,
        applyThemeUndoState: new ApplyThemeUndoStateOperation(
          new SetThemeOperation(themesStore, themeUiStore),
          new ApplyThemeStateAndSchedulePersistOperation(
            new ApplyThemeStateOperation(themeUiStore),
            debouncedThemePersist as never,
            themeUiStore,
          ),
        ),
        setColorVariableDark,
      }),
    );
    const controller = new SetColorVariableDarkController(
      themeUiStore,
      setColorVariableDark,
      new RecordThemeUndoOperation(
        new RecordUndoEntryOperation(undoStackStore),
        testUndo.buildUniversalUndoProcessor,
      ),
      testUndo.setCurrentUndoStackId,
    );

    testUndo.setCurrentUndoStackId.executeAndLoadForContext(deriveUndoContext({
      tabId: 'themes',
      themeRef: { name: 'theme-a', version: '1.0.0' },
      templateRef: { name: 'template-a', version: '1.0.0' },
    }));
    await testUndo.backgroundQueue.flush();

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

    await expect(testUndo.historyGoTo.execute(UNDO_BASELINE_FRAME_ID)).resolves.toMatchObject({
      status: 'transitioned',
      mode: 'go-to',
      entryId: UNDO_BASELINE_FRAME_ID,
    });

    expect(themeUiStore.getStore().state.theme?.colorAssignments[0].dark?.value).toBe('#111111');
    expect(undoStackStore.getStore().state.undoMenu.currentId).toBe(UNDO_BASELINE_FRAME_ID);
    expect(undoStackStore.getStore().state.undoMenu.canUndo).toBe(false);
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
            colorAssignments: [{ colorRef: 'editorFg' }, { colorRef: 'editorBg' }],
            contrastAssignments: [{ contrastVariableRef: 'editorContrast' }],
          },
        },
      }),
    };
    const loadThemeThen = vi.fn(async (_label: string, onLoaded: () => Promise<void>) => {
      await onLoaded();
    });
    const loadThemeWithLinkedTemplate = { execute: vi.fn(() => ({ then: loadThemeThen })) };
    const setCurrentUndoStackId = { executeAndLoadForContext: vi.fn() };
    const setThemePaneSelections = { execute: vi.fn() };
    const controller = new SelectThemeAndLoadController(
      themeUiStore as never,
      { execute: vi.fn() } as never,
      loadThemeWithLinkedTemplate as never,
      setThemePaneSelections as never,
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
    expect(setThemePaneSelections.execute).toHaveBeenCalledWith(
      ['editorFg', 'editorBg'],
      ['editorContrast'],
    );
  });

  it('selects all variables when a theme is selected by name', async () => {
    const theme = {
      name: 'theme-a',
      version: '1.0.0',
      templateRef: null,
      colorAssignments: [{ colorRef: 'editorFg' }, { colorRef: 'editorBg' }],
      contrastAssignments: [{ contrastVariableRef: 'editorContrast' }],
    };
    const themeUiStore = { getStore: () => ({ state: { theme } }) };
    const loadThemeThen = vi.fn(async (_label: string, onLoaded: () => Promise<void>) => {
      await onLoaded();
    });
    const setThemePaneSelections = { execute: vi.fn() };
    const controller = new SelectThemeByNameController(
      themeUiStore as never,
      { execute: vi.fn(() => [{ name: 'theme-a', version: '1.0.0' }]) } as never,
      { execute: vi.fn() } as never,
      { execute: vi.fn(() => ({ then: loadThemeThen })) } as never,
      setThemePaneSelections as never,
      { execute: vi.fn() } as never,
      { execute: vi.fn() } as never,
      { execute: vi.fn() } as never,
    );

    await controller.run('theme-a');

    expect(setThemePaneSelections.execute).toHaveBeenCalledWith(
      ['editorFg', 'editorBg'],
      ['editorContrast'],
    );
  });

  it('records palette color assignments and skips rejected palette commits', async () => {
    await undoManagerV2.clearPersisted();
    const themeUiStore = new ThemeUiStore();
    const themesStore = new ThemesStore();
    const undoStackStore = new UndoStackStore();
    const debouncedThemePersist = {
      schedule: vi.fn(),
    };
    const commitAssignColorText = new CommitAssignColorTextOperation(
      themeUiStore,
      themesStore,
      debouncedThemePersist as never,
    );
    const applyThemeUndoState = new ApplyThemeUndoStateOperation(
      new SetThemeOperation(themesStore, themeUiStore),
      new ApplyThemeStateAndSchedulePersistOperation(
        new ApplyThemeStateOperation(themeUiStore),
        debouncedThemePersist as never,
        themeUiStore,
      ),
    );
    const restorePaletteAssignUndo = new RestoreThemePaletteAssignUndoOperation(
      themeUiStore,
      applyThemeUndoState,
    );
    const testUndo = createTestUndoOperations(
      undoStackStore,
      createTestBuildUniversalUndoProcessor({
        applyCatalogUndoState: { execute: vi.fn() } as never,
        applyTemplateUndoState: { execute: vi.fn() } as never,
        applyThemeUndoState,
        restorePaletteAssignUndo: restorePaletteAssignUndo as never,
      }),
    );
    const controller = new AssignColorFromPickerController(
      commitAssignColorText,
      themeUiStore,
      new CatalogUiStore(),
      new TemplateUiStore(),
      new RecordThemeUndoOperation(
        new RecordUndoEntryOperation(undoStackStore),
        testUndo.buildUniversalUndoProcessor,
      ),
      testUndo.setCurrentUndoStackId,
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
    expect(debouncedThemePersist.schedule).not.toHaveBeenCalled();
    expect(undoStackStore.getStore().state.undoMenu.canUndo).toBe(false);

    themeUiStore.getStore().setThemePaneSelections(['editorFg'], []);
    await controller.run('#222222');
    expect(themeUiStore.getStore().state.theme?.colorAssignments[0].dark?.value).toBe('#222222');
    expect(undoStackStore.getStore().state.undoMenu.nextUndoDescription).toBe('Assign palette color: #222222');

    await testUndo.undo.execute();
    expect(themeUiStore.getStore().state.theme?.colorAssignments[0].dark?.value).toBe('#111111');

    const beforePickerPreview = themeUiStore.getStore().state.theme;
    expect(beforePickerPreview).not.toBeNull();
    new SetAssignColorPreviewOperation(themeUiStore).execute({
      normalizedHex: '#333333',
      theme: beforePickerPreview!,
      checkedColorRefs: new Set(['editorFg']),
      hueAdjustment: 0,
      saturationAdjustment: 0,
      valueAdjustment: 0,
    });
    expect(themeUiStore.getStore().state.theme?.colorAssignments[0].dark?.value).toBe('#333333');

    await controller.run('#333333', undefined, {
      theme: beforePickerPreview,
      checkedColorRefs: ['editorFg'],
      checkedContrastRefs: [],
      hueAdjustment: 0,
      saturationAdjustment: 0,
      valueAdjustment: 0,
      hueReferenceHex: '#FF0000',
    });
    const savedTheme = themesStore.getStore().state.themeMap['theme-a']?.['1.0.0']?.theme;
    expect(savedTheme?.colorAssignments[0].dark?.value).toBe('#333333');
    expect(undoStackStore.getStore().state.undoMenu.nextUndoDescription).toBe('Assign palette color: #333333');

    await controller.run('#444444', undefined, {
      theme: beforePickerPreview,
      checkedColorRefs: ['editorFg'],
      checkedContrastRefs: [],
      hueAdjustment: 0,
      saturationAdjustment: 0,
      valueAdjustment: 0,
      hueReferenceHex: '#FF0000',
    });
    expect(undoStackStore.getStore().state.undoMenu.nextUndoDescription).toBe('Assign palette color: #444444');
    expect(undoStackStore.getStore().state.undoMenu.recentActions).toHaveLength(1);

    await testUndo.undo.execute();
    expect(themeUiStore.getStore().state.theme?.colorAssignments[0].dark?.value).toBe('#111111');
  });

  describe('theme undo round-trips', () => {
    function createThemeUndoHarness(themeUiStore: ThemeUiStore, themesStore: ThemesStore) {
      const undoStackStore = new UndoStackStore();
      const debouncedThemePersist = {
        schedule: vi.fn(),
      };
      const setTheme = new SetThemeOperation(themesStore, themeUiStore);
      const applyThemeStateAndSchedulePersist = new ApplyThemeStateAndSchedulePersistOperation(
        new ApplyThemeStateOperation(themeUiStore),
        debouncedThemePersist as never,
        themeUiStore,
      );
      const applyThemeUndoState = new ApplyThemeUndoStateOperation(
        setTheme,
        applyThemeStateAndSchedulePersist,
      );
      const deleteTheme = {
        execute: vi.fn((name: string, version: string) => syncContinuation(() => {
          removeThemeVersion(themesStore, name, version);
        })),
      };
      const applyThemeLifecycleUndo = new ApplyThemeLifecycleUndoOperation(
        deleteTheme as never,
        applyThemeUndoState,
        { execute: vi.fn((ref) => themeUiStore.getStore().setSelectedRef(ref)) } as never,
        { execute: vi.fn(() => syncContinuation()) } as never,
        {
          execute: vi.fn(async (name: string, version: string) => {
            const entry = themesStore.getStore().state.themeMap[name]?.[version];
            if (entry?.theme) {
              themeUiStore.getStore().setTheme(entry.theme);
            }
          }),
        } as never,
        setTheme,
      );
      const setColorVariableDark = new SetColorVariableDarkOperation(
        themeUiStore,
        themesStore,
        debouncedThemePersist as never,
      );
      const setContrastVariableField = new SetContrastVariableFieldOperation(
        themeUiStore,
        themesStore,
        debouncedThemePersist as never,
      );
      const setContrastUseDarkForLight = new SetContrastUseDarkForLightOperation(
        themeUiStore,
        themesStore,
        debouncedThemePersist as never,
      );
      const setColorUseDarkForLight = new SetColorUseDarkForLightOperation(
        themeUiStore,
        themesStore,
        debouncedThemePersist as never,
      );
      const restorePaletteAssignUndo = new RestoreThemePaletteAssignUndoOperation(
        themeUiStore,
        applyThemeUndoState,
      );
      const buildUniversalUndoProcessor = createTestBuildUniversalUndoProcessor({
        applyCatalogUndoState: { execute: vi.fn() } as never,
        applyTemplateUndoState: { execute: vi.fn() } as never,
        applyThemeUndoState,
        applyThemeLifecycleUndo,
        restorePaletteAssignUndo: restorePaletteAssignUndo as never,
        setColorVariableDark,
        setContrastVariableField: setContrastVariableField as never,
        setContrastUseDarkForLight: setContrastUseDarkForLight as never,
        setColorUseDarkForLight: setColorUseDarkForLight as never,
        setHueAdjustment: new SetThemeHueAdjustmentOperation(themeUiStore),
        setSaturationAdjustment: new SetThemeSaturationAdjustmentOperation(themeUiStore),
        setValueAdjustment: new SetThemeValueAdjustmentOperation(themeUiStore),
        setThemePaneSelections: new SetThemePaneSelectionsOperation(themeUiStore),
      });
      const testUndo = createTestUndoOperations(undoStackStore, buildUniversalUndoProcessor);
      const recordThemeUndo = new RecordThemeUndoOperation(
        new RecordUndoEntryOperation(undoStackStore),
        buildUniversalUndoProcessor,
      );
      return {
        undoStackStore,
        testUndo,
        recordThemeUndo,
        debouncedThemePersist,
        setTheme,
        setContrastVariableField,
        setContrastUseDarkForLight,
        setColorUseDarkForLight,
      };
    }

    function seedTheme(themeUiStore: ThemeUiStore, themesStore: ThemesStore, darkHex = '#ff0000') {
      const theme = themeSchema.parse({
        name: 'theme-a',
        version: '1.0.0',
        templateRef: { name: 'template-a', version: '1.0.0' },
        colorAssignments: [
          { colorRef: 'editorFg', dark: { value: darkHex }, light: { value: '#eeeeee' }, useDarkForLight: false },
        ],
        contrastAssignments: [
          { contrastVariableRef: 'editorContrast', dark: { value: 4.5, comparisonMethod: 'greaterThan', min: 3, max: 7 }, light: { value: 3, comparisonMethod: 'equalTo', min: null, max: null }, useDarkForLight: false },
        ],
      });
      themeUiStore.getStore().setSelectedRef({ name: theme.name, version: theme.version });
      themeUiStore.getStore().setTheme(theme);
      themesStore.getStore().updateTheme(theme);
      return theme;
    }

    it('records, undoes, and redoes theme variable selection changes', async () => {
      await undoManagerV2.clearPersisted();
      const themeUiStore = new ThemeUiStore();
      const themesStore = new ThemesStore();
      const { testUndo, recordThemeUndo, undoStackStore } = createThemeUndoHarness(themeUiStore, themesStore);
      seedTheme(themeUiStore, themesStore);
      const controller = new ToggleVariableSelectionController(
        themeUiStore,
        new SetThemePaneSelectionsOperation(themeUiStore),
        new CatalogUiStore(),
        new TemplateUiStore(),
        recordThemeUndo,
        testUndo.setCurrentUndoStackId,
      );

      await controller.run(true, 'editorFg');
      expect(themeUiStore.getStore().state.checkedColorRefs).toEqual(['editorFg']);
      expect(undoStackStore.getStore().state.undoMenu.nextUndoDescription).toBe('Color variable selection changed');

      await controller.run(true, 'editorContrast');
      expect(themeUiStore.getStore().state.checkedContrastRefs).toEqual(['editorContrast']);
      expect(undoStackStore.getStore().state.undoMenu.nextUndoDescription).toBe('Contrast variable selection changed');
      expect(undoStackStore.getStore().state.undoMenu.recentActions).toHaveLength(2);

      await testUndo.undo.execute();
      expect(themeUiStore.getStore().state.checkedColorRefs).toEqual(['editorFg']);
      expect(themeUiStore.getStore().state.checkedContrastRefs).toEqual([]);

      await testUndo.undo.execute();
      expect(themeUiStore.getStore().state.checkedColorRefs).toEqual([]);

      await testUndo.redo.execute();
      expect(themeUiStore.getStore().state.checkedColorRefs).toEqual(['editorFg']);
    });

    it('records, undoes, and redoes a contrast dark value edit', async () => {
      await undoManagerV2.clearPersisted();
      const themeUiStore = new ThemeUiStore();
      const themesStore = new ThemesStore();
      const { testUndo, recordThemeUndo, setContrastVariableField } = createThemeUndoHarness(themeUiStore, themesStore);
      seedTheme(themeUiStore, themesStore);
      const controller = new SetContrastVariableDarkValueController(
        themeUiStore,
        setContrastVariableField,
        recordThemeUndo,
        testUndo.setCurrentUndoStackId,
      );

      await controller.run('editorContrast', 6);
      expect(themeUiStore.getStore().state.theme?.contrastAssignments[0].dark?.value).toBe(6);

      await testUndo.undo.execute();
      expect(themeUiStore.getStore().state.theme?.contrastAssignments[0].dark?.value).toBe(4.5);

      await testUndo.redo.execute();
      expect(themeUiStore.getStore().state.theme?.contrastAssignments[0].dark?.value).toBe(6);
    });

    it('records, undoes, and redoes a contrast use-dark-for-light toggle', async () => {
      await undoManagerV2.clearPersisted();
      const themeUiStore = new ThemeUiStore();
      const themesStore = new ThemesStore();
      const { testUndo, recordThemeUndo, setContrastUseDarkForLight } = createThemeUndoHarness(themeUiStore, themesStore);
      seedTheme(themeUiStore, themesStore);
      const controller = new SetContrastUseDarkForLightController(
        themeUiStore,
        setContrastUseDarkForLight,
        recordThemeUndo,
        testUndo.setCurrentUndoStackId,
      );

      await controller.run('editorContrast', true);
      expect(themeUiStore.getStore().state.theme?.contrastAssignments[0].useDarkForLight).toBe(true);

      await testUndo.undo.execute();
      expect(themeUiStore.getStore().state.theme?.contrastAssignments[0].useDarkForLight).toBe(false);

      await testUndo.redo.execute();
      expect(themeUiStore.getStore().state.theme?.contrastAssignments[0].useDarkForLight).toBe(true);
    });

    it('records, undoes, and redoes a color use-dark-for-light toggle', async () => {
      await undoManagerV2.clearPersisted();
      const themeUiStore = new ThemeUiStore();
      const themesStore = new ThemesStore();
      const { testUndo, recordThemeUndo, setColorUseDarkForLight } = createThemeUndoHarness(themeUiStore, themesStore);
      seedTheme(themeUiStore, themesStore);
      const controller = new SetColorUseDarkForLightController(
        themeUiStore,
        setColorUseDarkForLight,
        recordThemeUndo,
        testUndo.setCurrentUndoStackId,
      );

      await controller.run('editorFg', true);
      expect(themeUiStore.getStore().state.theme?.colorAssignments[0].useDarkForLight).toBe(true);

      await testUndo.undo.execute();
      expect(themeUiStore.getStore().state.theme?.colorAssignments[0].useDarkForLight).toBe(false);

      await testUndo.redo.execute();
      expect(themeUiStore.getStore().state.theme?.colorAssignments[0].useDarkForLight).toBe(true);
    });

    it('records, undoes, and redoes a hue recenter commit', async () => {
      await undoManagerV2.clearPersisted();
      const themeUiStore = new ThemeUiStore();
      const themesStore = new ThemesStore();
      const { testUndo, recordThemeUndo, undoStackStore } = createThemeUndoHarness(themeUiStore, themesStore);
      seedTheme(themeUiStore, themesStore);
      themeUiStore.getStore().setHueAdjustment(25);
      themeUiStore.getStore().setSaturationAdjustment(20);
      themeUiStore.getStore().setValueAdjustment(-15);
      themeUiStore.getStore().setThemePaneSelections(['editorFg'], []);
      const controller = new RecenterHueReferenceController(
        themeUiStore,
        new SetThemeOperation(themesStore, themeUiStore),
        new SetThemeHueAdjustmentOperation(themeUiStore),
        new SetThemeSaturationAdjustmentOperation(themeUiStore),
        new SetThemeValueAdjustmentOperation(themeUiStore),
        new ApplyThemeStateAndSchedulePersistOperation(
          new ApplyThemeStateOperation(themeUiStore),
          { schedule: vi.fn() } as never,
          themeUiStore,
        ),
        recordThemeUndo,
        testUndo.setCurrentUndoStackId,
      );

      const beforeDark = themeUiStore.getStore().state.theme?.colorAssignments[0].dark?.value;
      await controller.run();
      expect(themeUiStore.getStore().state.hueAdjustment).toBe(0);
      expect(themeUiStore.getStore().state.saturationAdjustment).toBe(0);
      expect(themeUiStore.getStore().state.valueAdjustment).toBe(0);
      expect(themeUiStore.getStore().state.theme?.colorAssignments[0].dark?.value).not.toBe(beforeDark);

      await waitForUndoRecorded(undoStackStore);
      await testUndo.undo.execute();
      expect(themeUiStore.getStore().state.theme?.colorAssignments[0].dark?.value).toBe(beforeDark);
      expect(themeUiStore.getStore().state.hueAdjustment).toBe(25);
      expect(themeUiStore.getStore().state.saturationAdjustment).toBe(20);
      expect(themeUiStore.getStore().state.valueAdjustment).toBe(-15);

      await testUndo.redo.execute();
      expect(themeUiStore.getStore().state.hueAdjustment).toBe(0);
      expect(themeUiStore.getStore().state.saturationAdjustment).toBe(0);
      expect(themeUiStore.getStore().state.valueAdjustment).toBe(0);
    });

    it('records, undoes, and redoes an eyedropper palette color assignment', async () => {
      await undoManagerV2.clearPersisted();
      const themeUiStore = new ThemeUiStore();
      const themesStore = new ThemesStore();
      const { testUndo, recordThemeUndo } = createThemeUndoHarness(themeUiStore, themesStore);
      seedTheme(themeUiStore, themesStore);
      themeUiStore.getStore().setThemePaneSelections(['editorFg'], []);
      const controller = new CommitAssignColorEyeDropperController(
        new CommitAssignColorTextOperation(
          themeUiStore,
          themesStore,
          { schedule: vi.fn() } as never,
        ),
        themeUiStore,
        new CatalogUiStore(),
        new TemplateUiStore(),
        recordThemeUndo,
        testUndo.setCurrentUndoStackId,
      );

      await controller.run('#222222');
      expect(themeUiStore.getStore().state.theme?.colorAssignments[0].dark?.value).toBe('#222222');

      await testUndo.undo.execute();
      expect(themeUiStore.getStore().state.theme?.colorAssignments[0].dark?.value).toBe('#ff0000');

      await testUndo.redo.execute();
      expect(themeUiStore.getStore().state.theme?.colorAssignments[0].dark?.value).toBe('#222222');
    });

    it('records, undoes, and redoes theme version increment', async () => {
      await undoManagerV2.clearPersisted();
      const themeUiStore = new ThemeUiStore();
      const themesStore = new ThemesStore();
      const { testUndo, recordThemeUndo, setTheme, undoStackStore } = createThemeUndoHarness(themeUiStore, themesStore);
      seedTheme(themeUiStore, themesStore);
      const saveTheme = { execute: vi.fn() };
      const controller = new IncrementThemeVersionController(
        { execute: vi.fn((ref) => themeUiStore.getStore().setSelectedRef(ref)) } as never,
        new SetThemeHueAdjustmentOperation(themeUiStore),
        saveTheme as never,
        { execute: vi.fn() } as never,
        { execute: vi.fn() } as never,
        { execute: vi.fn() } as never,
        setTheme,
        { execute: vi.fn() } as never,
        themeUiStore,
        recordThemeUndo,
        testUndo.setCurrentUndoStackId,
      );

      await controller.run();
      expect(themeUiStore.getStore().state.selectedRef?.version).toBe('1.0.1');
      expect(themesStore.getStore().state.themeMap['theme-a']?.['1.0.1']).toBeDefined();

      await waitForUndoRecorded(undoStackStore);
      await testUndo.undo.execute();
      await vi.waitFor(() => {
        expect(themeUiStore.getStore().state.selectedRef?.version).toBe('1.0.0');
      });
      expect(themesStore.getStore().state.themeMap['theme-a']?.['1.0.1']).toBeUndefined();

      await testUndo.redo.execute();
      expect(themeUiStore.getStore().state.selectedRef?.version).toBe('1.0.1');
    });

    it('records, undoes, and redoes theme version deletion', async () => {
      await undoManagerV2.clearPersisted();
      const themeUiStore = new ThemeUiStore();
      const themesStore = new ThemesStore();
      const { testUndo, recordThemeUndo, undoStackStore } = createThemeUndoHarness(themeUiStore, themesStore);
      seedTheme(themeUiStore, themesStore);
      const controller = new DeleteThemeVersionController(
        { execute: vi.fn((name, version) => {
          removeThemeVersion(themesStore, name, version);
          themeUiStore.getStore().setTheme(null);
        }) } as never,
        { execute: vi.fn() } as never,
        { execute: vi.fn(() => []) } as never,
        { execute: vi.fn((ref) => themeUiStore.getStore().setSelectedRef(ref)) } as never,
        { execute: vi.fn(async () => null) } as never,
        { execute: vi.fn() } as never,
        new SetThemeOperation(themesStore, themeUiStore),
        themeUiStore,
        recordThemeUndo,
        testUndo.setCurrentUndoStackId,
      );

      await controller.run('theme-a', '1.0.0');
      expect(themesStore.getStore().state.themeMap['theme-a']?.['1.0.0']).toBeUndefined();

      await waitForUndoRecorded(undoStackStore);
      await testUndo.undo.execute();
      expect(themesStore.getStore().state.themeMap['theme-a']?.['1.0.0']?.theme?.name).toBe('theme-a');

      await testUndo.redo.execute();
      expect(themesStore.getStore().state.themeMap['theme-a']?.['1.0.0']).toBeUndefined();
    });

    it('records, undoes, and redoes theme creation', async () => {
      await undoManagerV2.clearPersisted();
      const themeUiStore = new ThemeUiStore();
      const themesStore = new ThemesStore();
      const themeCreateDialogStore = new ThemeCreateDialogStore();
      const { testUndo, recordThemeUndo, setTheme, undoStackStore } = createThemeUndoHarness(themeUiStore, themesStore);
      const createTheme = {
        execute: vi.fn(async ({ name, sourceTheme }: { name: string; sourceTheme?: unknown }) => themeSchema.parse({
          name,
          version: '1.0.0',
          templateRef: sourceTheme ? { name: 'copied-template', version: '1.0.0' } : { name: 'template-a', version: '1.0.0' },
          colorAssignments: sourceTheme ? [{ colorRef: 'copiedColor', dark: { value: '#111111' }, light: null, useDarkForLight: true }] : [],
          contrastAssignments: [],
        })),
      };
      const controller = new CreateThemeController(
        createTheme as never,
        { execute: vi.fn() } as never,
        setTheme,
        { execute: vi.fn((ref) => themeUiStore.getStore().setSelectedRef(ref)) } as never,
        { execute: vi.fn() } as never,
        { execute: vi.fn() } as never,
        { execute: vi.fn() } as never,
        { execute: vi.fn() } as never,
        themeUiStore,
        themeCreateDialogStore,
        recordThemeUndo,
        testUndo.setCurrentUndoStackId,
      );

      await controller.run({ name: 'new-theme' });
      expect(themesStore.getStore().state.themeMap['new-theme']?.['1.0.0']?.theme?.name).toBe('new-theme');

      await waitForUndoRecorded(undoStackStore);
      await testUndo.undo.execute();
      await vi.waitFor(() => {
        expect(themesStore.getStore().state.themeMap['new-theme']).toBeUndefined();
      });

      await testUndo.redo.execute();
      expect(themesStore.getStore().state.themeMap['new-theme']?.['1.0.0']?.theme?.name).toBe('new-theme');

      const sourceTheme = themeSchema.parse({
        name: 'source-theme',
        version: '2.3.4',
        templateRef: { name: 'copied-template', version: '1.0.0' },
        colorAssignments: [{ colorRef: 'copiedColor', dark: { value: '#111111' }, light: null, useDarkForLight: true }],
        contrastAssignments: [],
      });
      themeUiStore.getStore().setTheme(sourceTheme);
      themeCreateDialogStore.getStore().setMode('duplicate');

      await controller.run({ name: 'copied-theme' });
      expect(createTheme.execute).toHaveBeenLastCalledWith({ name: 'copied-theme', sourceTheme });
      expect(themesStore.getStore().state.themeMap['copied-theme']?.['1.0.0']?.theme?.templateRef).toEqual({
        name: 'copied-template',
        version: '1.0.0',
      });
      expect(themesStore.getStore().state.themeMap['copied-theme']?.['1.0.0']?.theme?.colorAssignments).toHaveLength(1);
    });
  });

  describe('theme undo failure paths', () => {
    it('does not record undo entries for invalid contrast values', async () => {
      await undoManagerV2.clearPersisted();
      const themeUiStore = new ThemeUiStore();
      const themesStore = new ThemesStore();
      const undoStackStore = new UndoStackStore();
      const testUndo = createTestUndoOperations(
        undoStackStore,
        createMinimalTestBuildUniversalUndoProcessor(),
      );
      themeUiStore.getStore().setSelectedRef({ name: 'theme-a', version: '1.0.0' });
      themeUiStore.getStore().setTheme(themeSchema.parse({
        name: 'theme-a',
        version: '1.0.0',
        templateRef: { name: 'template-a', version: '1.0.0' },
        colorAssignments: [],
        contrastAssignments: [
          { contrastVariableRef: 'editorContrast', dark: { value: 4.5, comparisonMethod: 'greaterThan', min: 3, max: 7 }, light: { value: 3, comparisonMethod: 'equalTo', min: null, max: null }, useDarkForLight: false },
        ],
      }));
      const controller = new SetContrastVariableDarkValueController(
        themeUiStore,
        new SetContrastVariableFieldOperation(
          themeUiStore,
          themesStore,
          { schedule: vi.fn() } as never,
        ),
        new RecordThemeUndoOperation(
          new RecordUndoEntryOperation(undoStackStore),
          testUndo.buildUniversalUndoProcessor,
        ),
        testUndo.setCurrentUndoStackId,
      );

      await controller.run(undefined, 4.5);
      await controller.run('editorContrast', 4.5);
      expect(undoStackStore.getStore().state.undoMenu?.canUndo ?? false).toBe(false);
    });
  });
});
