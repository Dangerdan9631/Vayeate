import type { TabId } from '../../app/tabs';
import type {
  Catalog,
  CatalogName,
  CatalogType,
  ColorVariableKey,
  ContrastComparisonMethod,
  ContrastVariableKey,
  ContrastValue,
  HexColor,
  SourceType,
  Template,
  TemplateName,
  ThemeName,
  ThemePreviewTokenRefField,
  TokenKey,
  TokenType,
  Version,
} from '../../../model/schemas';
import { AppActionType } from '../../app/actions/app-action-type';
import { CatalogActionType } from '../../catalog/actions/catalog-action-type';
import { TemplateActionType } from '../../template/actions/template-action-type';
import { ThemeActionType } from '../../theme/actions/theme-action-type';

export type AppAction =
  | { type: AppActionType.AppFileMenuTriggerButtonOnClick }
  | { type: AppActionType.AppFileMenuExitButtonOnClick }
  | { type: AppActionType.AppEditMenuTriggerButtonOnClick }
  | { type: AppActionType.AppEditMenuUndoButtonOnClick }
  | { type: AppActionType.AppEditMenuRedoButtonOnClick }
  | { type: AppActionType.AppHistoryMenuTriggerButtonOnClick }
  | { type: AppActionType.AppHistoryMenuGoToButtonOnClick; frameId: string }
  | { type: AppActionType.AppViewMenuTriggerButtonOnClick }
  | { type: AppActionType.AppViewMenuReloadButtonOnClick }
  | { type: AppActionType.AppViewMenuForceReloadButtonOnClick }
  | { type: AppActionType.AppViewMenuToggleDevToolsButtonOnClick }
  | { type: AppActionType.AppMenuOnClose }
  | { type: AppActionType.AppRibbonTabButtonOnClick; tabId: TabId }
  | { type: AppActionType.AppBarThemeCheckboxOnToggle; checked: boolean }
  | { type: AppActionType.AppBarMinimizeButtonOnClick }
  | { type: AppActionType.AppBarMaximizeButtonOnClick }
  | { type: AppActionType.AppBarCloseButtonOnClick }
  | { type: AppActionType.AppBarTitleBarOnDrag }
  | { type: CatalogActionType.CatalogPageOnLoad }
  | { type: CatalogActionType.CatalogCatalogsListOnCommit; name: CatalogName; version: Version }
  | { type: CatalogActionType.CatalogCatalogsCreateButtonOnClick }
  | { type: CatalogActionType.CatalogCreateDialogOnOpen }
  | { type: CatalogActionType.CatalogCreateDialogNameTextOnChange; value: string }
  | { type: CatalogActionType.CatalogCreateDialogTypeListOnCommit; value: CatalogType }
  | { type: CatalogActionType.CatalogCreateDialogCancelButtonOnClick }
  | { type: CatalogActionType.CatalogCreateDialogOkButtonOnClick }
  | { type: CatalogActionType.CatalogDetailsDeleteVersionButtonOnClick; name: CatalogName; version: Version }
  | { type: CatalogActionType.CatalogDetailsSyncButtonOnClick; catalog: Catalog }
  | { type: CatalogActionType.CatalogDetailsLockButtonOnClick }
  | { type: CatalogActionType.CatalogDetailsRevertButtonOnClick; name: CatalogName; version: Version }
  | { type: CatalogActionType.CatalogDetailsSaveCatalog; catalog: Catalog }
  | { type: CatalogActionType.CatalogDetailsSourceUrlTextOnCommit; value: string; sourceIndex: number }
  | { type: CatalogActionType.CatalogDetailsSourceTokenTypeListOnCommit; value: TokenType; sourceIndex: number }
  | { type: CatalogActionType.CatalogDetailsSourceTypeListOnCommit; value: SourceType; sourceIndex: number }
  | { type: CatalogActionType.CatalogDetailsSourceRemoveButtonOnClick; sourceIndex: number }
  | { type: CatalogActionType.CatalogDetailsNewSourceUrlTextOnChange; value: string }
  | { type: CatalogActionType.CatalogDetailsNewSourceTokenTypeListOnCommit; value: TokenType }
  | { type: CatalogActionType.CatalogDetailsNewSourceTypeListOnCommit; value: SourceType }
  | { type: CatalogActionType.CatalogDetailsNewSourceAddButtonOnClick }
  | { type: CatalogActionType.CatalogTokensSearchTextOnChange; value: string }
  | { type: CatalogActionType.CatalogTokensBulkAddButtonOnClick }
  | { type: CatalogActionType.CatalogTokensExistingTokenKeyTextOnCommit; value: string; key: TokenKey; tokenType: TokenType }
  | { type: CatalogActionType.CatalogTokensTokenRemoveButtonOnClick; key: TokenKey; tokenType: TokenType }
  | { type: CatalogActionType.CatalogTokensNewTokenKeyTextOnChange; value: string }
  | { type: CatalogActionType.CatalogTokensNewTokenAddButtonOnClick; tokenType: TokenType; key?: string }
  | { type: CatalogActionType.CatalogBulkAddTokensDialogOnOpen }
  | { type: CatalogActionType.CatalogBulkAddTokensTextOnChange; value: string }
  | { type: CatalogActionType.CatalogBulkAddTokensCancelButtonOnClick }
  | { type: CatalogActionType.CatalogBulkAddTokensOkButtonOnClick }
  | { type: TemplateActionType.TemplatePageOnLoad }
  | { type: TemplateActionType.TemplateTemplatesListOnCommit; name: TemplateName; version: Version }
  | { type: TemplateActionType.TemplateTemplatesCreateButtonOnClick }
  | { type: TemplateActionType.TemplateCreateDialogOnOpen }
  | { type: TemplateActionType.TemplateCreateDialogNameTextOnChange; value: string }
  | { type: TemplateActionType.TemplateCreateDialogCancelButtonOnClick }
  | { type: TemplateActionType.TemplateCreateDialogOkButtonOnClick; params: { name: TemplateName } }
  | { type: TemplateActionType.TemplateDetailsDeleteVersionButtonOnClick; name: TemplateName; version: Version }
  | { type: TemplateActionType.TemplateDetailsLockButtonOnClick }
  | { type: TemplateActionType.TemplateDetailsUpdateAllButtonOnClick }
  | { type: TemplateActionType.TemplateDetailsCatalogCheckboxOnToggle; checked: boolean; catalogName: CatalogName }
  | { type: TemplateActionType.TemplateDetailsCatalogVersionListOnCommit; value: Version; catalogName: CatalogName }
  | { type: TemplateActionType.TemplateDetailsSaveTemplate; template: Template }
  | { type: TemplateActionType.TemplateMappingSearchTextOnChange; value: string }
  | { type: TemplateActionType.TemplateMappingColorVariableFilterListOnSelect; values: ColorVariableKey[] }
  | { type: TemplateActionType.TemplateMappingContrastVariableFilterListOnSelect; values: ContrastVariableKey[] }
  | { type: TemplateActionType.TemplateMappingExistingTokenGroupListOnCommit; value: string; tokenKey: string; tokenType: TokenType }
  | { type: TemplateActionType.TemplateMappingTokenGroupSelectionOnCommit; value: string }
  | { type: TemplateActionType.TemplateMappingExistingTokenColorVariableListOnCommit; value: ColorVariableKey; tokenKey: string; tokenType: TokenType; isOrphan?: boolean }
  | { type: TemplateActionType.TemplateMappingExistingTokenContrastVariableListOnCommit; value: ContrastVariableKey | null; tokenKey: string; tokenType: TokenType }
  | { type: TemplateActionType.TemplateMappingSemanticTokenAddVariantButtonOnClick; semanticType: string; modifiers: string[]; language: string | null; defaultGroupRef?: string | null }
  | { type: TemplateActionType.TemplateMappingSemanticTokenModifierListOnCommit; tokenKey: string; modifiers: string[]; language: string | null }
  | { type: TemplateActionType.TemplateMappingSemanticTokenLanguageListOnCommit; value: string; tokenKey: string; modifiers: string[] }
  | { type: TemplateActionType.TemplateMappingSemanticTokenVariantRemoveButtonOnClick; tokenKey: string; tokenType: TokenType }
  | { type: TemplateActionType.TemplateGroupAddTextOnChange; value: string }
  | { type: TemplateActionType.TemplateGroupAddButtonOnClick; name: string }
  | { type: TemplateActionType.TemplateGroupRemoveButtonOnClick; groupId: string }
  | { type: TemplateActionType.TemplateVariablesSearchTextOnChange; value: string }
  | { type: TemplateActionType.TemplateVariablesAddVariableNameTextOnChange; value: string }
  | { type: TemplateActionType.TemplateVariablesAddVariableButtonOnClick; key: string; groupRef: string | null; variableKind: 'color' | 'contrast' }
  | { type: TemplateActionType.TemplateVariablesGroupListOnCommit; value: string; variableKey: string }
  | { type: TemplateActionType.TemplateVariablesRemoveButtonOnClick; key: ColorVariableKey | ContrastVariableKey }
  | { type: TemplateActionType.TemplateVariablesContrastSourceListOnCommit; value: ColorVariableKey | null; contrastVariableKey: ContrastVariableKey }
  | { type: ThemeActionType.ThemePageOnLoad }
  | { type: ThemeActionType.ThemePageSaveErrorDismissButtonOnClick }
  | { type: ThemeActionType.ThemeThemesNameListOnCommit; name: ThemeName }
  | { type: ThemeActionType.ThemeThemesVersionListOnCommit; name: ThemeName; version: Version }
  | { type: ThemeActionType.ThemeThemesCreateButtonOnClick }
  | { type: ThemeActionType.ThemeCreateDialogOnOpen }
  | { type: ThemeActionType.ThemeCreateDialogNameTextOnChange; value: string }
  | { type: ThemeActionType.ThemeCreateDialogCancelButtonOnClick }
  | { type: ThemeActionType.ThemeCreateDialogOkButtonOnClick; params: { name: ThemeName } }
  | { type: ThemeActionType.ThemeDetailsDeleteVersionButtonOnClick; name: ThemeName; version: Version }
  | { type: ThemeActionType.ThemeDetailsIncrementVersionButtonOnClick }
  | { type: ThemeActionType.ThemeDetailsGenerateButtonOnClick; themeName: ThemeName; themeVersion: Version; templateName: TemplateName; templateVersion: Version }
  | { type: ThemeActionType.ThemeDetailsTemplateListOnCommit; name: TemplateName; version: Version }
  | { type: ThemeActionType.ThemeDetailsTemplateVersionListOnCommit; name: TemplateName; version: Version }
  | { type: ThemeActionType.ThemeDetailsPreviewTokenRefListOnCommit; tokenRefField: ThemePreviewTokenRefField; value: TokenKey | null }
  | { type: ThemeActionType.ThemeDetailsCatalogCheckboxOnToggle; checked: boolean }
  | { type: ThemeActionType.ThemeDetailsCatalogVersionListOnCommit; value: Version }
  | { type: ThemeActionType.ThemePaletteApplyToDarkCheckboxOnToggle; checked: boolean }
  | { type: ThemeActionType.ThemePaletteApplyToLightCheckboxOnToggle; checked: boolean }
  | { type: ThemeActionType.ThemePaletteAssignColorTextOnChange; value: string }
  | { type: ThemeActionType.ThemePaletteAssignColorTextOnCommit; value: string }
  | { type: ThemeActionType.ThemePaletteAssignColorButtonOnClick }
  | { type: ThemeActionType.ThemePaletteAssignColorEyedropperButtonOnClick; colorRef: string }
  | { type: ThemeActionType.ThemePaletteAssignColorPickerOnSelect; value: HexColor }
  | { type: ThemeActionType.ThemePaletteAssignColorPickerOnCommit; value: HexColor }
  | { type: ThemeActionType.ThemePaletteAssignColorPickerOnClose }
  | { type: ThemeActionType.ThemePaletteHueReferenceColorTextOnChange; value: string }
  | { type: ThemeActionType.ThemePaletteHueReferenceColorTextOnCommit; value: string }
  | { type: ThemeActionType.ThemePaletteHueReferenceColorButtonOnClick }
  | { type: ThemeActionType.ThemePaletteHueReferenceColorEyedropperButtonOnClick }
  | { type: ThemeActionType.ThemePaletteHueReferenceColorPickerOnSelect; value: HexColor }
  | { type: ThemeActionType.ThemePaletteHueReferenceColorPickerOnCommit; value: HexColor }
  | { type: ThemeActionType.ThemePaletteHueReferenceRecenterButtonOnClick }
  | { type: ThemeActionType.ThemePaletteHueSliderOnDelta; value: number }
  | { type: ThemeActionType.ThemePaletteHueSliderOnCommit; value: number }
  | { type: ThemeActionType.ThemePaletteClusterCountSliderOnDelta; value: number }
  | { type: ThemeActionType.ThemePaletteClusterCountSliderOnCommit; value: number }
  | { type: ThemeActionType.ThemePaletteClusterGroupCheckboxOnToggle; checked: boolean; groupId: string }
  | { type: ThemeActionType.ThemePaletteSwatchFullSelectCheckboxOnToggle; fullColorRefs: string[]; fullContrastRefs: string[] }
  | { type: ThemeActionType.ThemePaletteSwatchGroupSelectCheckboxOnToggle; refs: string[]; checked: boolean }
  | { type: ThemeActionType.ThemePalettePrimarySwatchButtonOnClick; ref: string }
  | { type: ThemeActionType.ThemePalettePrimarySwatchButtonOnDoubleClick; ref: string }
  | { type: ThemeActionType.ThemePalettePrimarySwatchButtonOnRightClick; ref: string }
  | { type: ThemeActionType.ThemePaletteMemberSwatchButtonOnClick; ref: string }
  | { type: ThemeActionType.ThemePaletteMemberSwatchButtonOnRightClick; ref: string }
  | { type: ThemeActionType.ThemeVariablesSelectAllCheckboxOnToggle; checked: boolean }
  | { type: ThemeActionType.ThemeVariablesSelectVariableTypeCheckboxOnToggle; checked: boolean; variableType: string }
  | { type: ThemeActionType.ThemeVariablesSelectVariableGroupCheckboxOnToggle; checked: boolean; groupId: string }
  | { type: ThemeActionType.ThemeVariablesSearchTextOnChange; value: string }
  | { type: ThemeActionType.ThemeVariablesVariableSelectionCheckboxOnToggle; ref: ColorVariableKey | ContrastVariableKey; checked: boolean }
  | { type: ThemeActionType.ThemeVariablesLightUseDarkCheckboxOnToggle; checked: boolean; ref: ContrastVariableKey }
  | { type: ThemeActionType.ThemeVariablesColorUseDarkForLightCheckboxOnToggle; checked: boolean; ref: ColorVariableKey }
  | { type: ThemeActionType.ThemeVariablesColorDarkTextOnChange; value: string; ref: ColorVariableKey }
  | { type: ThemeActionType.ThemeVariablesColorDarkTextOnCommit; value: string; ref: ColorVariableKey }
  | { type: ThemeActionType.ThemeVariablesColorDarkColorButtonOnClick; ref: ColorVariableKey }
  | { type: ThemeActionType.ThemeVariablesColorDarkColorEyedropperButtonOnClick; ref: ColorVariableKey }
  | { type: ThemeActionType.ThemeVariablesColorDarkColorPickerOnSelect; value: HexColor; ref: ColorVariableKey }
  | { type: ThemeActionType.ThemeVariablesColorDarkColorPickerOnCommit; value: HexColor; ref: ColorVariableKey }
  | { type: ThemeActionType.ThemeVariablesColorLightTextOnChange; value: string; ref: ColorVariableKey }
  | { type: ThemeActionType.ThemeVariablesColorLightTextOnCommit; value: string; ref: ColorVariableKey }
  | { type: ThemeActionType.ThemeVariablesColorLightColorButtonOnClick; ref: ColorVariableKey }
  | { type: ThemeActionType.ThemeVariablesColorLightColorEyedropperButtonOnClick; ref: ColorVariableKey }
  | { type: ThemeActionType.ThemeVariablesColorLightColorPickerOnSelect; value: HexColor; ref: ColorVariableKey }
  | { type: ThemeActionType.ThemeVariablesColorLightColorPickerOnCommit; value: HexColor; ref: ColorVariableKey }
  | { type: ThemeActionType.ThemeVariablesContrastDarkValueTextOnChange; value: string; ref: ContrastVariableKey }
  | { type: ThemeActionType.ThemeVariablesContrastDarkValueTextOnCommit; value: ContrastValue; ref: ContrastVariableKey }
  | { type: ThemeActionType.ThemeVariablesContrastDarkMethodListOnCommit; value: ContrastComparisonMethod; ref: ContrastVariableKey }
  | { type: ThemeActionType.ThemeVariablesContrastDarkMinTextOnChange; value: string; ref: ContrastVariableKey }
  | { type: ThemeActionType.ThemeVariablesContrastDarkMinTextOnCommit; value: string; ref: ContrastVariableKey }
  | { type: ThemeActionType.ThemeVariablesContrastDarkMaxTextOnChange; value: string; ref: ContrastVariableKey }
  | { type: ThemeActionType.ThemeVariablesContrastDarkMaxTextOnCommit; value: string; ref: ContrastVariableKey }
  | { type: ThemeActionType.ThemeVariablesContrastLightValueTextOnChange; value: string; ref: ContrastVariableKey }
  | { type: ThemeActionType.ThemeVariablesContrastLightValueTextOnCommit; value: ContrastValue; ref: ContrastVariableKey }
  | { type: ThemeActionType.ThemeVariablesContrastLightMethodListOnCommit; value: ContrastComparisonMethod; ref: ContrastVariableKey }
  | { type: ThemeActionType.ThemeVariablesContrastLightMinTextOnChange; value: string; ref: ContrastVariableKey }
  | { type: ThemeActionType.ThemeVariablesContrastLightMinTextOnCommit; value: string; ref: ContrastVariableKey }
  | { type: ThemeActionType.ThemeVariablesContrastLightMaxTextOnChange; value: string; ref: ContrastVariableKey }
  | { type: ThemeActionType.ThemeVariablesContrastLightMaxTextOnCommit; value: string; ref: ContrastVariableKey }
  | { type: ThemeActionType.ThemePreviewVariableListOnCommit; value: string }
  | { type: ThemeActionType.ThemePreviewVariableFilterTextOnChange; value: string }
  | { type: ThemeActionType.ThemePreviewVariableFilterClearOnClick }
  | { type: ThemeActionType.ThemePreviewSampleButtonOnClick }
  | { type: ThemeActionType.ThemePreviewSampleListOnCommit; value: string }
  | { type: ThemeActionType.ThemeEyedropperOverlayCancelButtonOnClick }
  | { type: ThemeActionType.ThemeEyedropperOverlayColorCommitOnClick; hex: HexColor };
