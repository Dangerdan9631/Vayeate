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
              colorAssignments={vm.displayColorAssignments}
              colorVariables={vm.colorVariablesFromTemplate}
              groups={vm.groupsFromTemplate}
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
              colorVariableKeys={vm.colorVariableKeys}
              idePrimaryColorRef={vm.theme.idePrimaryColorVariableRef}
              onChangeIdePrimaryColorRef={vm.changeIdePrimaryColorRef}
              idePrimaryColorContrastRef={vm.theme.idePrimaryColorContrastVariableRef ?? null}
              onChangeIdePrimaryColorContrastRef={vm.changeIdePrimaryColorContrastRef}
              themeBackgroundColorRef={vm.theme.themeBackgroundColorVariableRef}
              onChangeThemeBackgroundColorRef={vm.changeThemeBackgroundColorRef}
              mappings={vm.templateMappings}
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
