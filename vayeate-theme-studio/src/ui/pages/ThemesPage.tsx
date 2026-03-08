import { useThemeViewModel } from '../../viewmodel/use-theme-viewmodel';
import { CreateThemeDialog } from '../components/CreateThemeDialog';
import { EditorPreviewsCard } from '../components/EditorPreviewsCard';
import { ThemeDetailsCard } from '../components/ThemeDetailsCard';
import { ThemePaletteCard } from '../components/ThemePaletteCard';
import { ThemeVariablesCard } from '../components/ThemeVariablesCard';
import { ThemesCard } from '../components/ThemesCard';

export function ThemesPage() {
  const vm = useThemeViewModel();

  return (
    <>
      {vm.saveError && (
        <div className="theme-save-error-banner" role="alert">
          <span className="theme-save-error-message">{vm.saveError}</span>
          <button
            type="button"
            className="theme-save-error-dismiss"
            onClick={vm.dismissSaveError}
            aria-label="Dismiss"
          >
            <span className="material-symbols-outlined" aria-hidden>close</span>
          </button>
        </div>
      )}
      <div className="themes-page-grid">
        <div className="themes-left-col">
          <ThemesCard
            themeNames={vm.themeNames}
            selectedName={vm.selectedName}
            versionsForSelectedName={vm.versionsForSelectedName}
            selectedRef={vm.selectedRef}
            onSelectName={vm.selectName}
            onSelectVersion={(version) => {
              if (vm.selectedName) vm.selectTheme(vm.selectedName, version);
            }}
            onCreateClick={vm.openCreateDialog}
            isCreating={vm.isCreating}
          />
          {vm.theme && (
            <ThemeDetailsCard
              theme={vm.theme}
              templateNamesList={vm.templateNamesList}
              templateVersionsByName={vm.templateVersionsByName}
              selectedTemplateName={vm.selectedTemplateName}
              selectedTemplateVersion={vm.selectedTemplateVersion}
              canGenerate={vm.canGenerate}
              generateResult={vm.generateResult}
              onDeleteVersion={() => {
                if (vm.selectedRef) vm.deleteVersion(vm.selectedRef.name, vm.selectedRef.version);
              }}
              onGenerate={vm.generateTheme}
              onBumpVersion={vm.bumpVersion}
              onChangeTemplate={vm.changeTemplate}
              onChangeTemplateVersion={vm.changeTemplateVersion}
            />
          )}
          {vm.theme && vm.theme.templateRef && (
            <ThemePaletteCard
              hueAdjustment={vm.hueAdjustment}
              onHueChange={vm.setHueAdjustment}
              onCommit={vm.commitHueAdjustment}
              onRevert={vm.revertHueAdjustment}
              applyToDark={vm.applyHueToDark}
              applyToLight={vm.applyHueToLight}
              onApplyToDarkChange={vm.setApplyHueToDark}
              onApplyToLightChange={vm.setApplyHueToLight}
              colorAssignments={vm.displayColorAssignments}
              colorVariables={vm.colorVariablesFromTemplate}
              groups={vm.groupsFromTemplate}
              checkedColorRefs={vm.checkedColorRefs}
              onSetColorGroupChecked={vm.setColorGroupChecked}
              onSetColorRefsChecked={vm.setColorRefsChecked}
              selectedColorsDisplay={vm.selectedColorsDisplay}
              onSetSelectedColors={vm.setSelectedColorsToHex}
              canRevertPalettePicker={vm.canRevertPalettePicker}
              onPalettePickerOpen={vm.capturePalettePickerState}
              onRevertPalettePicker={vm.revertPalettePicker}
            />
          )}
          {vm.theme && vm.theme.templateRef && (
            <ThemeVariablesCard
              colorAssignments={vm.displayColorAssignments}
              contrastAssignments={vm.theme.contrastAssignments}
              colorVariables={vm.colorVariablesFromTemplate}
              contrastVariables={vm.contrastVariablesFromTemplate}
              groups={vm.groupsFromTemplate}
              orphanColorKeys={vm.orphanColorKeys}
              orphanContrastKeys={vm.orphanContrastKeys}
              checkedColorRefs={vm.checkedColorRefs}
              checkedContrastRefs={vm.checkedContrastRefs}
              onToggleColorChecked={vm.toggleColorChecked}
              onToggleContrastChecked={vm.toggleContrastChecked}
              onSetAllColorChecked={vm.setAllColorChecked}
              onSetAllContrastChecked={vm.setAllContrastChecked}
              onSetAllVariablesChecked={vm.setAllVariablesChecked}
              onSetColorGroupChecked={vm.setColorGroupChecked}
              onSetContrastGroupChecked={vm.setContrastGroupChecked}
              colorSectionState={vm.colorSectionState}
              contrastSectionState={vm.contrastSectionState}
              cardState={vm.cardState}
              onUpdateColorDark={vm.updateColorAssignmentDark}
              onUpdateColorLight={vm.updateColorAssignmentLight}
              onUpdateColorUseDark={vm.updateColorAssignmentUseDarkForLight}
              onUpdateContrastDark={vm.updateContrastAssignmentDark}
              onUpdateContrastLight={vm.updateContrastAssignmentLight}
              onUpdateContrastUseDark={vm.updateContrastAssignmentUseDarkForLight}
            />
          )}
        </div>
        <div className="themes-right-col">
          {vm.theme && vm.theme.templateRef && (
            <EditorPreviewsCard
              colorAssignments={vm.displayColorAssignments}
              contrastAssignments={vm.theme.contrastAssignments}
              contrastVariables={vm.contrastVariablesFromTemplate}
              mappings={vm.templateMappings}
              idePrimaryTokenRef={vm.theme.idePrimaryTokenRef ?? null}
              onChangeIdePrimaryTokenRef={vm.changeIdePrimaryTokenRef}
              ideForegroundTokenRef={vm.theme.ideForegroundTokenRef ?? null}
              onChangeIdeForegroundTokenRef={vm.changeIdeForegroundTokenRef}
              themeBackgroundTokenRef={vm.theme.themeBackgroundTokenRef ?? null}
              onChangeThemeBackgroundTokenRef={vm.changeThemeBackgroundTokenRef}
              themeForegroundTokenRef={vm.theme.themeForegroundTokenRef ?? null}
              onChangeThemeForegroundTokenRef={vm.changeThemeForegroundTokenRef}
              lineNumberBackgroundTokenRef={vm.theme.lineNumberBackgroundTokenRef ?? null}
              onChangeLineNumberBackgroundTokenRef={vm.changeLineNumberBackgroundTokenRef}
              lineNumberForegroundTokenRef={vm.theme.lineNumberForegroundTokenRef ?? null}
              onChangeLineNumberForegroundTokenRef={vm.changeLineNumberForegroundTokenRef}
              ideTabTokenRef={vm.theme.ideTabTokenRef ?? null}
              onChangeIdeTabTokenRef={vm.changeIdeTabTokenRef}
              ideTabBarBackgroundTokenRef={vm.theme.ideTabBarBackgroundTokenRef ?? null}
              onChangeIdeTabBarBackgroundTokenRef={vm.changeIdeTabBarBackgroundTokenRef}
              ideTabBarForegroundTokenRef={vm.theme.ideTabBarForegroundTokenRef ?? null}
              onChangeIdeTabBarForegroundTokenRef={vm.changeIdeTabBarForegroundTokenRef}
              editorPreviewScrollbarBackgroundTokenRef={vm.theme.editorPreviewScrollbarBackgroundTokenRef ?? null}
              onChangeEditorPreviewScrollbarBackgroundTokenRef={vm.changeEditorPreviewScrollbarBackgroundTokenRef}
              editorPreviewScrollbarForegroundTokenRef={vm.theme.editorPreviewScrollbarForegroundTokenRef ?? null}
              onChangeEditorPreviewScrollbarForegroundTokenRef={vm.changeEditorPreviewScrollbarForegroundTokenRef}
              editorPreviewSelectionBackgroundTokenRef={vm.theme.editorPreviewSelectionBackgroundTokenRef ?? null}
              onChangeEditorPreviewSelectionBackgroundTokenRef={vm.changeEditorPreviewSelectionBackgroundTokenRef}
            />
          )}
        </div>
      </div>
      {vm.createDialogOpen && (
        <CreateThemeDialog
          onCancel={vm.closeCreateDialog}
          onCreate={vm.createTheme}
        />
      )}
    </>
  );
}
