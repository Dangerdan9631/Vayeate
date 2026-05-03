import { singleton } from 'tsyringe';
import { ApplyThemeStateAndSchedulePersistOperation } from '../../../../domain/operations/theme-operations/theme-details/apply-theme-state-and-schedule-persist-operation';
import { LoadThemeOperation } from '../../../../domain/operations/theme-operations/theme-details/load-theme-operation';
import { SetSelectedThemeRefOperation } from '../../../../domain/operations/theme-operations/theme-list/set-selected-theme-ref-operation';
import { SetThemeLoadedTemplateOperation } from '../../../../domain/operations/theme-operations/theme-details/set-theme-loaded-template-operation';
import { SetThemePaneSelectionsOperation } from '../../../../domain/operations/theme-operations/pickers/set-theme-pane-selections-operation';
import { LoadTemplateSnapshotOperation } from '../../../../domain/operations/template-operations/template-details/load-template-snapshot-operation';
import { ThemeUiStore } from '../../../../domain/state/ui/theme-ui-store';

@singleton()
export class SelectThemeAndLoadController {
  constructor(
    private readonly themeUiStore: ThemeUiStore,
    private readonly setSelectedThemeRef: SetSelectedThemeRefOperation,
    private readonly loadTheme: LoadThemeOperation,
    private readonly setThemePaneSelections: SetThemePaneSelectionsOperation,
    private readonly loadTemplateSnapshot: LoadTemplateSnapshotOperation,
    private readonly applyThemeStateAndSchedulePersist: ApplyThemeStateAndSchedulePersistOperation,
    private readonly setThemeLoadedTemplate: SetThemeLoadedTemplateOperation,
  ) {}

  async run(name: string, version: string): Promise<void> {
    this.setSelectedThemeRef.execute({ name, version });
    this.loadTheme.execute(name, version)
    .then('Loading theme', async () => {
      const theme = this.themeUiStore.getStore().state.theme;
      if (!theme) return;
      this.setThemePaneSelections.execute([], []);
      const template =
        theme?.templateRef != null
          ? await this.loadTemplateSnapshot.execute(theme.templateRef.name, theme.templateRef.version)
          : null;
      if (theme) this.applyThemeStateAndSchedulePersist.execute(theme);
      this.setThemeLoadedTemplate.execute(template);
      
    })
    
  }
}
