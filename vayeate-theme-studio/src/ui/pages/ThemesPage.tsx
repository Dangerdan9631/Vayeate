import { useThemeViewModel } from '../../viewmodel/use-theme-viewmodel';
import { CreateThemeDialog } from '../components/CreateThemeDialog';
import { EditorPreviewsCard } from '../components/EditorPreviewsCard';
import { ThemeDetailsCard } from '../components/ThemeDetailsCard';
import { ThemeVariablesCard } from '../components/ThemeVariablesCard';
import { ThemesCard } from '../components/ThemesCard';

export function ThemesPage() {
  const vm = useThemeViewModel();

  return (
    <>
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
            <ThemeVariablesCard
              colorAssignments={vm.theme.colorAssignments}
              contrastAssignments={vm.theme.contrastAssignments}
              contrastVariables={vm.contrastVariablesFromTemplate}
              orphanColorKeys={vm.orphanColorKeys}
              orphanContrastKeys={vm.orphanContrastKeys}
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
              colorAssignments={vm.theme.colorAssignments}
              colorVariableKeys={vm.colorVariableKeys}
              idePrimaryColorRef={vm.theme.idePrimaryColorVariableRef}
              onChangeIdePrimaryColorRef={vm.changeIdePrimaryColorRef}
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
