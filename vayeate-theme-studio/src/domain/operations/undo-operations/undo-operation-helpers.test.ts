import { describe, expect, it } from 'vitest';
import { UNDO_BASELINE_FRAME_ID } from '../../../model/undo-history';
import { buildUndoMenuFrames } from './undo-operation-helpers';

describe('undo operation helpers', () => {
  it('orders menu frames newest first with the opened baseline last', () => {
    const baseline = { id: UNDO_BASELINE_FRAME_ID, description: 'Opened theme-a@1.0.0' };
    const frames = buildUndoMenuFrames([
      { id: 'first', description: 'Change editorFg dark color' },
      { id: 'second', description: 'Change editorBg dark color' },
    ], baseline);

    expect(frames).toEqual([
      { id: 'second', description: 'Change editorBg dark color' },
      { id: 'first', description: 'Change editorFg dark color' },
      baseline,
    ]);
  });

  it('shows only the baseline when no actions are recorded', () => {
    const baseline = { id: UNDO_BASELINE_FRAME_ID, description: 'Opened' };
    expect(buildUndoMenuFrames([], baseline)).toEqual([baseline]);
  });
});
