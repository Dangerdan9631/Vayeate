import type { ColorVariableKey } from '../../../model/schema/primitives';
import type { Template } from '../../../model/schema/template-schemas';
import type { Theme } from '../../../model/schema/theme-schemas';
import type { ThemeLifecycleUndoSnapshot } from '../../../model/theme-undo-lifecycle';
import {
  THEME_COLOR_VARIABLE_DARK_SET,
  THEME_COLOR_VARIABLE_LIGHT_SET,
  THEME_CREATED,
  THEME_LOADED_TEMPLATE_SET,
  THEME_PALETTE_COLOR_ASSIGNED,
  THEME_PALETTE_HUE_ADJUSTMENT_SET,
  THEME_PALETTE_HUE_REFERENCE_SET,
  THEME_PANE_SELECTIONS_SET,
  THEME_UNDO_ACTION_TYPES,
  THEME_VERSION_DELETED,
  THEME_VERSION_INCREMENTED,
} from '../../../model/undo-action-types';
import type { UndoAction } from '../../core/undo-stack-types';
import type { UndoDiffHandler } from '../../core/undo-processor';
import type { CommitAssignColorTextOperation } from '../theme-operations/palette-color-assign/commit-assign-color-text-operation';
import type { SetThemeHueAdjustmentOperation } from '../theme-operations/palette-hue/set-theme-hue-adjustment-operation';
import type { SetThemeHueReferenceHexOperation } from '../theme-operations/palette-hue/set-theme-hue-reference-hex-operation';
import type { SetThemePaneSelectionsOperation } from '../theme-operations/pickers/set-theme-pane-selections-operation';
import type { SetColorVariableDarkOperation } from '../theme-operations/theme-details/set-color-variable-dark-operation';
import type { SetColorVariableLightOperation } from '../theme-operations/theme-details/set-color-variable-light-operation';
import type { SetThemeLoadedTemplateOperation } from '../theme-operations/theme-details/set-theme-loaded-template-operation';
import type { ApplyThemeLifecycleUndoOperation } from './apply-theme-lifecycle-undo-operation';
import type { ApplyThemeUndoStateOperation } from './apply-theme-undo-state-operation';

const LIFECYCLE_ACTION_TYPES = new Set<string>([
  THEME_VERSION_DELETED,
  THEME_VERSION_INCREMENTED,
  THEME_CREATED,
]);

export interface ThemeUndoHandlerDeps {
  applyThemeUndoState: ApplyThemeUndoStateOperation;
  applyThemeLifecycleUndo: ApplyThemeLifecycleUndoOperation;
  commitAssignColorText: CommitAssignColorTextOperation;
  setColorVariableLight: SetColorVariableLightOperation;
  setColorVariableDark: SetColorVariableDarkOperation;
  setHueAdjustment: SetThemeHueAdjustmentOperation;
  setHueReferenceHex: SetThemeHueReferenceHexOperation;
  setThemePaneSelections: SetThemePaneSelectionsOperation;
  setLoadedTemplate: SetThemeLoadedTemplateOperation;
}

interface ThemePaneSelectionsUndoValue {
  checkedColorRefs?: unknown;
  checkedContrastRefs?: unknown;
}

function readStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
}

function restorePaneSelections(
  value: unknown,
  setThemePaneSelections: SetThemePaneSelectionsOperation,
): void {
  const selections = value as ThemePaneSelectionsUndoValue;
  setThemePaneSelections.execute(
    readStringArray(selections.checkedColorRefs),
    readStringArray(selections.checkedContrastRefs),
  );
}

function themeSnapshotHandler(
  actionType: string,
  applyThemeUndoState: ApplyThemeUndoStateOperation,
): UndoDiffHandler {
  return {
    actionType,
    apply: (action) => applyThemeUndoState.execute(action.after as Theme),
    revert: (action) => applyThemeUndoState.execute(action.before as Theme),
  };
}

export function buildThemeUndoHandlers(deps: ThemeUndoHandlerDeps): UndoDiffHandler[] {
  const specialized: UndoDiffHandler[] = [
    {
      actionType: THEME_PALETTE_COLOR_ASSIGNED,
      apply: (action) => deps.commitAssignColorText.restore(action.after as Theme),
      revert: (action) => deps.commitAssignColorText.restore(action.before as Theme),
    },
    {
      actionType: THEME_COLOR_VARIABLE_LIGHT_SET,
      apply: (action) => {
        deps.setColorVariableLight.execute(action.target as ColorVariableKey, String(action.after ?? ''));
      },
      revert: (action) => {
        deps.setColorVariableLight.execute(action.target as ColorVariableKey, String(action.before ?? ''));
      },
    },
    {
      actionType: THEME_COLOR_VARIABLE_DARK_SET,
      apply: (action) => {
        deps.setColorVariableDark.execute(action.target as ColorVariableKey, String(action.after ?? ''));
      },
      revert: (action) => {
        deps.setColorVariableDark.execute(action.target as ColorVariableKey, String(action.before ?? ''));
      },
    },
    {
      actionType: THEME_PALETTE_HUE_ADJUSTMENT_SET,
      apply: (action) => deps.setHueAdjustment.execute(Number(action.after ?? 0)),
      revert: (action) => deps.setHueAdjustment.execute(Number(action.before ?? 0)),
    },
    {
      actionType: THEME_PALETTE_HUE_REFERENCE_SET,
      apply: (action) => deps.setHueReferenceHex.execute(String(action.after ?? '')),
      revert: (action) => deps.setHueReferenceHex.execute(String(action.before ?? '')),
    },
    {
      actionType: THEME_PANE_SELECTIONS_SET,
      apply: (action) => restorePaneSelections(action.after, deps.setThemePaneSelections),
      revert: (action) => restorePaneSelections(action.before, deps.setThemePaneSelections),
    },
    {
      actionType: THEME_LOADED_TEMPLATE_SET,
      apply: (action) => deps.setLoadedTemplate.execute((action.after as Template | null) ?? null),
      revert: (action) => deps.setLoadedTemplate.execute((action.before as Template | null) ?? null),
    },
  ];

  const specializedTypes = new Set(specialized.map((handler) => handler.actionType));
  const snapshotHandlers = THEME_UNDO_ACTION_TYPES
    .filter((actionType) => !specializedTypes.has(actionType) && !LIFECYCLE_ACTION_TYPES.has(actionType))
    .map((actionType) => themeSnapshotHandler(actionType, deps.applyThemeUndoState));

  const lifecycleHandlers: UndoDiffHandler[] = [
    {
      actionType: THEME_VERSION_DELETED,
      apply: (action: UndoAction) => deps.applyThemeLifecycleUndo.applyVersionDeleted(
        action.before as ThemeLifecycleUndoSnapshot,
        action.after as ThemeLifecycleUndoSnapshot,
      ),
      revert: (action: UndoAction) => deps.applyThemeLifecycleUndo.revertVersionDeleted(
        action.before as ThemeLifecycleUndoSnapshot,
      ),
    },
    {
      actionType: THEME_VERSION_INCREMENTED,
      apply: (action: UndoAction) => deps.applyThemeLifecycleUndo.applyVersionIncremented(
        action.after as ThemeLifecycleUndoSnapshot,
      ),
      revert: (action: UndoAction) => deps.applyThemeLifecycleUndo.revertVersionIncremented(
        action.before as ThemeLifecycleUndoSnapshot,
        action.after as ThemeLifecycleUndoSnapshot,
      ),
    },
    {
      actionType: THEME_CREATED,
      apply: (action: UndoAction) => deps.applyThemeLifecycleUndo.applyCreated(
        action.after as ThemeLifecycleUndoSnapshot,
      ),
      revert: (action: UndoAction) => deps.applyThemeLifecycleUndo.revertCreated(
        action.before as ThemeLifecycleUndoSnapshot,
        action.after as ThemeLifecycleUndoSnapshot,
      ),
    },
  ];

  return [...snapshotHandlers, ...specialized, ...lifecycleHandlers];
}
