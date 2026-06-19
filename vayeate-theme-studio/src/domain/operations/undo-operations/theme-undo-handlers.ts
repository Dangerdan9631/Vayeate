import type { ColorVariableKey, ContrastVariableKey } from '../../../model/schema/primitives';
import type { Template } from '../../../model/schema/template-schemas';
import type { Theme } from '../../../model/schema/theme-schemas';
import type { ThemePreviewTokenRefField } from '../../../model/schema/theme-schemas';
import type { ThemeLifecycleUndoSnapshot } from '../../../model/theme-undo-lifecycle';
import type { ThemePaletteAssignUndoValue } from '../../../model/theme-palette-assign-undo';
import {
  THEME_COLOR_USE_DARK_FOR_LIGHT_SET,
  THEME_COLOR_VARIABLE_DARK_SET,
  THEME_COLOR_VARIABLE_LIGHT_SET,
  THEME_CONTRAST_USE_DARK_FOR_LIGHT_SET,
  THEME_CREATED,
  THEME_LOADED_TEMPLATE_SET,
  THEME_PALETTE_APPLY_TO_DARK_SET,
  THEME_PALETTE_APPLY_TO_LIGHT_SET,
  THEME_PALETTE_CLUSTER_COUNT_SET,
  THEME_PALETTE_COLOR_ASSIGNED,
  THEME_PALETTE_HUE_ADJUSTMENT_SET,
  THEME_PALETTE_HUE_REFERENCE_SET,
  THEME_PANE_SELECTIONS_SET,
  THEME_PREVIEW_TOKEN_REF_SET,
  THEME_UNDO_ACTION_TYPES,
  THEME_VERSION_DELETED,
  THEME_VERSION_INCREMENTED,
} from '../../../model/undo-action-types';
import type { UndoAction } from '../../core/undo-stack-types';
import type { UndoDiffHandler } from '../../core/undo-processor';
import { resolveThemeContrastActionField, THEME_CONTRAST_FIELD_ACTION_TYPES } from '../../utils/theme-contrast-undo-utils';
import type { SetThemeHueAdjustmentOperation } from '../theme-operations/palette-hue/set-theme-hue-adjustment-operation';
import type { SetThemeHueReferenceHexOperation } from '../theme-operations/palette-hue/set-theme-hue-reference-hex-operation';
import type { SetThemePaneSelectionsOperation } from '../theme-operations/pickers/set-theme-pane-selections-operation';
import type { SetColorUseDarkForLightOperation } from '../theme-operations/theme-details/set-color-use-dark-for-light-operation';
import type { SetColorVariableDarkOperation } from '../theme-operations/theme-details/set-color-variable-dark-operation';
import type { SetColorVariableLightOperation } from '../theme-operations/theme-details/set-color-variable-light-operation';
import type { SetContrastUseDarkForLightOperation } from '../theme-operations/theme-details/set-contrast-use-dark-for-light-operation';
import type { SetContrastVariableFieldOperation } from '../theme-operations/theme-details/set-contrast-variable-field-operation';
import type { SetThemeApplyPaletteToDarkOperation } from '../theme-operations/theme-details/set-theme-apply-palette-to-dark-operation';
import type { SetThemeApplyPaletteToLightOperation } from '../theme-operations/theme-details/set-theme-apply-palette-to-light-operation';
import type { SetThemeLoadedTemplateOperation } from '../theme-operations/theme-details/set-theme-loaded-template-operation';
import type { SetThemePaletteClusterCountOperation } from '../theme-operations/theme-details/set-theme-palette-cluster-count-operation';
import type { SetThemePreviewTokenRefFieldOperation } from '../theme-operations/theme-details/set-theme-preview-token-ref-field-operation';
import type { ApplyThemeLifecycleUndoOperation } from './apply-theme-lifecycle-undo-operation';
import type { ApplyThemeUndoStateOperation } from './apply-theme-undo-state-operation';
import type { RestoreThemePaletteAssignUndoOperation } from './restore-theme-palette-assign-undo-operation';

const LIFECYCLE_ACTION_TYPES = new Set<string>([
  THEME_VERSION_DELETED,
  THEME_VERSION_INCREMENTED,
  THEME_CREATED,
]);

const FIELD_LEVEL_ACTION_TYPES = new Set<string>([
  ...THEME_CONTRAST_FIELD_ACTION_TYPES,
  THEME_CONTRAST_USE_DARK_FOR_LIGHT_SET,
  THEME_COLOR_USE_DARK_FOR_LIGHT_SET,
  THEME_PALETTE_APPLY_TO_LIGHT_SET,
  THEME_PALETTE_APPLY_TO_DARK_SET,
  THEME_PALETTE_CLUSTER_COUNT_SET,
  THEME_PREVIEW_TOKEN_REF_SET,
  THEME_PALETTE_COLOR_ASSIGNED,
  THEME_COLOR_VARIABLE_LIGHT_SET,
  THEME_COLOR_VARIABLE_DARK_SET,
  THEME_PALETTE_HUE_ADJUSTMENT_SET,
  THEME_PALETTE_HUE_REFERENCE_SET,
  THEME_PANE_SELECTIONS_SET,
  THEME_LOADED_TEMPLATE_SET,
]);

/**
 * Input or state shape for theme undo handler deps.
 */
export interface ThemeUndoHandlerDeps {
  applyThemeUndoState: ApplyThemeUndoStateOperation;
  applyThemeLifecycleUndo: ApplyThemeLifecycleUndoOperation;
  restorePaletteAssignUndo: RestoreThemePaletteAssignUndoOperation;
  setColorVariableLight: SetColorVariableLightOperation;
  setColorVariableDark: SetColorVariableDarkOperation;
  setContrastVariableField: SetContrastVariableFieldOperation;
  setContrastUseDarkForLight: SetContrastUseDarkForLightOperation;
  setColorUseDarkForLight: SetColorUseDarkForLightOperation;
  setApplyPaletteToLight: SetThemeApplyPaletteToLightOperation;
  setApplyPaletteToDark: SetThemeApplyPaletteToDarkOperation;
  setPaletteClusterCount: SetThemePaletteClusterCountOperation;
  setPreviewTokenRefField: SetThemePreviewTokenRefFieldOperation;
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

function readPreviewTokenRefField(target: string): ThemePreviewTokenRefField {
  const suffix = target.split(':').at(-1);
  if (suffix === 'previewColorRef' || suffix === 'previewContrastRef' || suffix === 'previewGroupRef') {
    return suffix as ThemePreviewTokenRefField;
  }
  return target as ThemePreviewTokenRefField;
}

function buildContrastFieldHandlers(deps: ThemeUndoHandlerDeps): UndoDiffHandler[] {
  return THEME_CONTRAST_FIELD_ACTION_TYPES.map((actionType) => ({
    actionType,
    apply: (action: UndoAction) => {
      const mapping = resolveThemeContrastActionField(actionType);
      if (!mapping) return;
      deps.setContrastVariableField.execute(
        action.target as ContrastVariableKey,
        mapping.side,
        mapping.field,
        action.after as never,
      );
    },
    revert: (action: UndoAction) => {
      const mapping = resolveThemeContrastActionField(actionType);
      if (!mapping) return;
      deps.setContrastVariableField.execute(
        action.target as ContrastVariableKey,
        mapping.side,
        mapping.field,
        action.before as never,
      );
    },
  }));
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

/**
 * Builds theme undo diff handlers for snapshot, specialized, and lifecycle actions.
 * @param deps Operations used to apply theme undo, palette edits, and lifecycle replay.
 * @returns Handler list wired for the universal undo processor.
 */
export function buildThemeUndoHandlers(deps: ThemeUndoHandlerDeps): UndoDiffHandler[] {
  const specialized: UndoDiffHandler[] = [
    ...buildContrastFieldHandlers(deps),
    {
      actionType: THEME_PALETTE_COLOR_ASSIGNED,
      apply: (action) => deps.restorePaletteAssignUndo.execute(action.after as ThemePaletteAssignUndoValue),
      revert: (action) => deps.restorePaletteAssignUndo.execute(action.before as ThemePaletteAssignUndoValue),
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
      actionType: THEME_CONTRAST_USE_DARK_FOR_LIGHT_SET,
      apply: (action) => {
        deps.setContrastUseDarkForLight.execute(action.target as ContrastVariableKey, action.after === true);
      },
      revert: (action) => {
        deps.setContrastUseDarkForLight.execute(action.target as ContrastVariableKey, action.before === true);
      },
    },
    {
      actionType: THEME_COLOR_USE_DARK_FOR_LIGHT_SET,
      apply: (action) => {
        deps.setColorUseDarkForLight.execute(action.target as ColorVariableKey, action.after === true);
      },
      revert: (action) => {
        deps.setColorUseDarkForLight.execute(action.target as ColorVariableKey, action.before === true);
      },
    },
    {
      actionType: THEME_PALETTE_APPLY_TO_LIGHT_SET,
      apply: (action) => {
        deps.setApplyPaletteToLight.execute(action.after === true);
      },
      revert: (action) => {
        deps.setApplyPaletteToLight.execute(action.before === true);
      },
    },
    {
      actionType: THEME_PALETTE_APPLY_TO_DARK_SET,
      apply: (action) => {
        deps.setApplyPaletteToDark.execute(action.after === true);
      },
      revert: (action) => {
        deps.setApplyPaletteToDark.execute(action.before === true);
      },
    },
    {
      actionType: THEME_PALETTE_CLUSTER_COUNT_SET,
      apply: (action) => {
        deps.setPaletteClusterCount.execute(Number(action.after ?? 1));
      },
      revert: (action) => {
        deps.setPaletteClusterCount.execute(Number(action.before ?? 1));
      },
    },
    {
      actionType: THEME_PREVIEW_TOKEN_REF_SET,
      apply: (action) => {
        deps.setPreviewTokenRefField.execute(
          readPreviewTokenRefField(action.target),
          (action.after as string | null) ?? null,
        );
      },
      revert: (action) => {
        deps.setPreviewTokenRefField.execute(
          readPreviewTokenRefField(action.target),
          (action.before as string | null) ?? null,
        );
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

  const snapshotHandlers = THEME_UNDO_ACTION_TYPES
    .filter((actionType) => !FIELD_LEVEL_ACTION_TYPES.has(actionType) && !LIFECYCLE_ACTION_TYPES.has(actionType))
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
