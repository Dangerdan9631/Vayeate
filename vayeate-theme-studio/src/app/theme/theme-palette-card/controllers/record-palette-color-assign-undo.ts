import type { ThemePaletteAssignUndoValue } from '../../../../model/theme-palette-assign-undo';

import type { RecordThemeUndoOperation } from '../../../../domain/operations/undo-operations/record-theme-undo-operation';

import { THEME_PALETTE_COLOR_ASSIGNED } from '../../../../model/undo-action-types';



/**

 * Records an undo entry after palette color assign undo.

 * @param recordThemeUndo Undo recording operation to invoke.

 * @param input Undo entry payload.

 * @returns Promise resolved after the undo entry is stored.

 */

export async function recordPaletteColorAssignUndo(

  recordThemeUndo: RecordThemeUndoOperation,

  input: {

    description: string;

    target: string;

    before: ThemePaletteAssignUndoValue;

    after: ThemePaletteAssignUndoValue;

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

