import { singleton } from 'tsyringe';
import type { TemplateName, Version } from '../../../../model/Common/schema/primitives';
import { LoadTemplateSnapshotOperation } from '../../../../domain/operations/Template/template-operations/template-details/load-template-snapshot-operation';
import { ApplyThemeStateAndSchedulePersistOperation } from '../../../../domain/operations/Theme/theme-operations/theme-details/apply-theme-state-and-schedule-persist-operation';
import { SetThemeLoadedTemplateOperation } from '../../../../domain/operations/Theme/theme-operations/theme-details/set-theme-loaded-template-operation';
import { RecordThemeUndoOperation } from '../../../../domain/operations/Theme/theme-undo-operations/record-theme-undo-operation';
import { SetCurrentUndoStackIdOperation } from '../../../../domain/operations/Undo/undo-operations/set-current-undo-stack-id-operation';
import { ThemePreviewStore } from '../../../../domain/state/Theme/ui/theme-preview-store';
import { ThemeUiStore } from '../../../../domain/state/Theme/ui/theme-ui-store';
import { MergeAssignmentsFromTemplateOperation } from '../../../../domain/operations/Template/template-operations/merge-assignments-from-template-operation';
import { deriveUndoContext } from '../../../../model/Undo/undo-history';
import { THEME_LOADED_TEMPLATE_SET, THEME_TEMPLATE_SET } from '../../../../model/Undo/undo-action-types';

/**
 * Orchestrates set theme template work for the theme UI.
 */
@singleton()
export class SetThemeTemplateController {
  constructor(
    private readonly themeUiStore: ThemeUiStore,
    private readonly themePreviewStore: ThemePreviewStore,
    private readonly applyThemeStateAndSchedulePersist: ApplyThemeStateAndSchedulePersistOperation,
    private readonly loadTemplateSnapshot: LoadTemplateSnapshotOperation,
    private readonly mergeAssignmentsFromTemplate: MergeAssignmentsFromTemplateOperation,
    private readonly setThemeLoadedTemplate: SetThemeLoadedTemplateOperation,
    private readonly recordThemeUndo: RecordThemeUndoOperation,
    private readonly setCurrentUndoStackId: SetCurrentUndoStackIdOperation,
  ) {}

  /**
 * Validates input and invokes the domain operations for this interaction.
 * @param name Input for this call.
 * @param version Input for this call.
 * @returns Promise resolved when orchestration completes.
   */
  async run(name: TemplateName, version: Version): Promise<void> {
    const theme = this.themeUiStore.getStore().state.theme;
    if (!theme) return;
    const template = await this.loadTemplateSnapshot.execute(name, version);
    if (!template) return;

    const beforeTemplate = this.themePreviewStore.getStore().state.loadedTemplateForTheme ?? null;

    this.setCurrentUndoStackId.executeForContext(deriveUndoContext({
      tabId: 'themes',
      templateRef: theme.templateRef,
      themeRef: { name: theme.name, version: theme.version },
    }));

    const before = theme;
    const merged = this.mergeAssignmentsFromTemplate.execute(theme, template);
    this.applyThemeStateAndSchedulePersist.execute(merged);
    this.setThemeLoadedTemplate.execute(template);

    const target = `${theme.name}@${theme.version}:template`;
    await this.recordThemeUndo.execute({
      description: 'Change theme template',
      actionType: THEME_TEMPLATE_SET,
      target,
      before,
      after: merged,
      extraDiffs: [{
        actionType: THEME_LOADED_TEMPLATE_SET,
        target,
        before: beforeTemplate,
        after: template,
      }],
    });
  }
}
