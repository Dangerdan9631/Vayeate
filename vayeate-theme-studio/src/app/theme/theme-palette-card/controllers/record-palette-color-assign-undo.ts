import type { Theme } from '../../../../model/schema/theme-schemas';
import type { RecordThemeUndoOperation } from '../../../../domain/operations/undo-operations/record-theme-undo-operation';
import { THEME_PALETTE_COLOR_ASSIGNED } from '../../../../model/undo-action-types';

export async function recordPaletteColorAssignUndo(
  recordThemeUndo: RecordThemeUndoOperation,
  input: {
    description: string;
    target: string;
    before: Theme;
    after: Theme;
  },
): Promise<void> {
  await recordThemeUndo.execute({
    description: input.description,
    actionType: THEME_PALETTE_COLOR_ASSIGNED,
    target: input.target,
    before: input.before,
    after: input.after,
    coalesceWithPrevious: true,
  });
}
