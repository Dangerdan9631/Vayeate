import type { RecordThemeUndoOperation } from '../../../../domain/operations/undo-operations/record-theme-undo-operation';
import {
  THEME_PALETTE_HUE_ADJUSTMENT_SET,
  THEME_PALETTE_HUE_REFERENCE_SET,
} from '../../../../model/undo-action-types';

/**
 * Records an undo entry after commit hue reference color undo.
 * @param recordThemeUndo Undo recording operation to invoke.
 * @param input Undo entry payload.
 * @returns Promise resolved after the undo entry is stored.
 */
export async function recordCommitHueReferenceColorUndo(
  recordThemeUndo: RecordThemeUndoOperation,
  input: {
    description: string;
    target: string;
    beforeHueReferenceHex: string;
    beforeHueAdjustment: number;
    afterHueReferenceHex: string;
  },
): Promise<void> {
  await recordThemeUndo.execute({
    description: input.description,
    actionType: THEME_PALETTE_HUE_REFERENCE_SET,
    target: input.target,
    before: input.beforeHueReferenceHex,
    after: input.afterHueReferenceHex,
    extraDiffs: [{
      actionType: THEME_PALETTE_HUE_ADJUSTMENT_SET,
      target: input.target,
      before: input.beforeHueAdjustment,
      after: 0,
    }],
  });
}
