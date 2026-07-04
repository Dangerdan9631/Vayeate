import type { SetCurrentUndoStackIdOperation } from '../../../../domain/operations/undo-operations/set-current-undo-stack-id-operation';
import type { RecordThemeUndoOperation } from '../../../../domain/operations/undo-operations/record-theme-undo-operation';
import type { CatalogUiStore } from '../../../../domain/state/ui/catalog-ui-store';
import type { TemplateUiStore } from '../../../../domain/state/ui/template-ui-store';
import type { ThemeUiStore } from '../../../../domain/state/ui/theme-ui-store';
import type { PendingPaletteAdjustmentCommit } from '../../theme-pane-selection/commit-pending-palette-adjustment-for-selection';
import {
  THEME_PALETTE_HUE_ADJUSTMENT_SET,
  THEME_PALETTE_HUE_RECENTERED,
  THEME_PALETTE_SATURATION_ADJUSTMENT_SET,
  THEME_PALETTE_VALUE_ADJUSTMENT_SET,
  THEME_PANE_SELECTIONS_SET,
} from '../../../../model/undo-action-types';
import { deriveUndoContext } from '../../../../model/undo-history';

/**
 * Shape used by the Theme Variables Card for theme pane selections undo value.
 */
export interface ThemePaneSelectionsUndoValue {
  checkedColorRefs: string[];
  checkedContrastRefs: string[];
}

function arraysEqual(a: readonly string[], b: readonly string[]): boolean {
  return a.length === b.length && a.every((value, index) => value === b[index]);
}

/**
 * Returns whether two theme pane selection snapshots contain the same ordered refs.
 * @param before Previous selection snapshot.
 * @param after Next selection snapshot.
 * @returns True when both color and contrast selections match.
 */
export function themePaneSelectionsEqual(
  before: ThemePaneSelectionsUndoValue,
  after: ThemePaneSelectionsUndoValue,
): boolean {
  return (
    arraysEqual(before.checkedColorRefs, after.checkedColorRefs) &&
    arraysEqual(before.checkedContrastRefs, after.checkedContrastRefs)
  );
}

function selectionScope(before: ThemePaneSelectionsUndoValue, after: ThemePaneSelectionsUndoValue): string {
  const colorChanged = !arraysEqual(before.checkedColorRefs, after.checkedColorRefs);
  const contrastChanged = !arraysEqual(before.checkedContrastRefs, after.checkedContrastRefs);
  if (colorChanged && !contrastChanged) return 'color-variable';
  if (!colorChanged && contrastChanged) return 'contrast-variable';
  return 'theme-variable';
}

function selectionDescription(scope: string): string {
  return `${scope.charAt(0).toUpperCase()}${scope.slice(1).replace(/-/g, ' ')} selection changed`;
}

/**
 * Records an undo entry after theme pane selection undo.
 * @param recordThemeUndo Undo recording operation to invoke.
 * @param input Undo entry payload.
 * @returns Promise resolved after the undo entry is stored.
 */
export async function recordThemePaneSelectionUndo(
  recordThemeUndo: RecordThemeUndoOperation,
  setCurrentUndoStackId: SetCurrentUndoStackIdOperation,
  themeUiStore: ThemeUiStore,
  templateUiStore: TemplateUiStore,
  catalogUiStore: CatalogUiStore,
  input: {
    description: string;
    before: ThemePaneSelectionsUndoValue;
    after: ThemePaneSelectionsUndoValue;
    paletteAdjustment?: PendingPaletteAdjustmentCommit | null;
  },
): Promise<void> {
  const theme = themeUiStore.getStore().state.theme;
  if (!theme) return;

  const context = deriveUndoContext({
    tabId: 'themes',
    templateRef: templateUiStore.getStore().state.selectedRef ?? theme.templateRef,
    catalogRef: catalogUiStore.getStore().state.selectedRef,
    themeRef: { name: theme.name, version: theme.version },
  });
  setCurrentUndoStackId.executeForContext(context);
  const scope = selectionScope(input.before, input.after);
  const selectionTarget = `${theme.name}@${theme.version}:pane-selections:${scope}`;
  if (input.paletteAdjustment) {
    const target = `${theme.name}@${theme.version}:palette-selection-recenter`;
    await recordThemeUndo.execute({
      description: selectionDescription(scope),
      actionType: THEME_PALETTE_HUE_RECENTERED,
      target,
      before: input.paletteAdjustment.beforeTheme,
      after: input.paletteAdjustment.afterTheme,
      extraDiffs: [
        {
          actionType: THEME_PALETTE_HUE_ADJUSTMENT_SET,
          target,
          before: input.paletteAdjustment.hueAdjustment,
          after: 0,
        },
        {
          actionType: THEME_PALETTE_SATURATION_ADJUSTMENT_SET,
          target,
          before: input.paletteAdjustment.saturationAdjustment,
          after: 0,
        },
        {
          actionType: THEME_PALETTE_VALUE_ADJUSTMENT_SET,
          target,
          before: input.paletteAdjustment.valueAdjustment,
          after: 0,
        },
        {
          actionType: THEME_PANE_SELECTIONS_SET,
          target: selectionTarget,
          before: input.before,
          after: input.after,
        },
      ],
    });
    return;
  }

  await recordThemeUndo.execute({
    description: selectionDescription(scope),
    actionType: THEME_PANE_SELECTIONS_SET,
    target: selectionTarget,
    before: input.before,
    after: input.after,
    coalesceWithPrevious: true,
  });
}
