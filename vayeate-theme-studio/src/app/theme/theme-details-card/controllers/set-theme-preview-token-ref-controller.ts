import { singleton } from 'tsyringe';
import type { ThemePreviewTokenRefField } from '../../../../model/schema/theme-schemas';
import { SetThemeHueAdjustmentOperation } from '../../../../domain/operations/theme-operations/palette-hue/set-theme-hue-adjustment-operation';
import { SetThemeHueReferenceHexOperation } from '../../../../domain/operations/theme-operations/palette-hue/set-theme-hue-reference-hex-operation';
import { SetThemePreviewTokenRefFieldOperation } from '../../../../domain/operations/theme-operations/theme-details/set-theme-preview-token-ref-field-operation';
import { RecordThemeUndoOperation } from '../../../../domain/operations/undo-operations/record-theme-undo-operation';
import { SetCurrentUndoStackIdOperation } from '../../../../domain/operations/undo-operations/set-current-undo-stack-id-operation';
import { ThemeUiStore } from '../../../../domain/state/ui/theme-ui-store';
import { applyHueShift } from '../../../../domain/utils/color-hsl';
import { deriveUndoContext } from '../../../../model/undo-history';
import {
  THEME_PALETTE_HUE_ADJUSTMENT_SET,
  THEME_PALETTE_HUE_REFERENCE_SET,
  THEME_PREVIEW_TOKEN_REF_SET,
} from '../../../../model/undo-action-types';

/**
 * Set a preview token ref field (THEME_DETAILS_PREVIEW_TOKEN_REF_LIST_ON_COMMIT). Updates theme, saves, recenters hue.
 */
/**
 * Orchestrates set theme preview token ref work for the theme UI.
 */
@singleton()
export class SetThemePreviewTokenRefController {
  constructor(
    private readonly themeUiStore: ThemeUiStore,
    private readonly setPreviewTokenRefField: SetThemePreviewTokenRefFieldOperation,
    private readonly setThemeHueReferenceHex: SetThemeHueReferenceHexOperation,
    private readonly setThemeHueAdjustment: SetThemeHueAdjustmentOperation,
    private readonly recordThemeUndo: RecordThemeUndoOperation,
    private readonly setCurrentUndoStackId: SetCurrentUndoStackIdOperation,
  ) {}

  /**
 * Validates input and invokes the domain operations for this interaction.
 * @param tokenRefField Input for this call.
 * @param value Input for this call.
 * @returns Promise resolved when orchestration completes.
   */
  async run(tokenRefField: ThemePreviewTokenRefField, value: string | null): Promise<void> {
    const state = this.themeUiStore.getStore().state;
    const theme = state.theme;
    if (!theme) return;

    const beforeHueReferenceHex = state.hueReferenceHex ?? '';
    const beforeHueAdjustment = state.hueAdjustment ?? 0;

    this.setCurrentUndoStackId.executeForContext(deriveUndoContext({
      tabId: 'themes',
      templateRef: theme.templateRef,
      themeRef: { name: theme.name, version: theme.version },
    }));

    const edit = this.setPreviewTokenRefField.execute(tokenRefField, value);
    if (!edit?.changed) return;

    const nextRefHex = applyHueShift(beforeHueReferenceHex, beforeHueAdjustment / 100);
    this.setThemeHueReferenceHex.execute(nextRefHex);
    this.setThemeHueAdjustment.execute(0);

    const target = `${theme.name}@${theme.version}:${tokenRefField}`;
    await this.recordThemeUndo.execute({
      description: 'Set preview token ref',
      actionType: THEME_PREVIEW_TOKEN_REF_SET,
      target,
      before: edit.before,
      after: edit.after,
      extraDiffs: [
        {
          actionType: THEME_PALETTE_HUE_REFERENCE_SET,
          target: `${theme.name}@${theme.version}:hue-reference`,
          before: beforeHueReferenceHex,
          after: nextRefHex,
        },
        {
          actionType: THEME_PALETTE_HUE_ADJUSTMENT_SET,
          target: `${theme.name}@${theme.version}:hue-adjustment`,
          before: beforeHueAdjustment,
          after: 0,
        },
      ],
    });
  }
}
