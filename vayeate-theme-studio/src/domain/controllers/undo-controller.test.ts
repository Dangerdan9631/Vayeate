import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as undoOperations from '../operations/undo-operations';
import { performUndo, performRedo, performHistoryGoTo } from './undo-controller';

vi.mock('../operations/undo-operations', () => ({
  performUndo: vi.fn(),
  performRedo: vi.fn(),
  performHistoryGoTo: vi.fn(),
}));

describe('undo-controller', () => {
  const setState = vi.fn();
  const getState = vi.fn();

  beforeEach(() => {
    vi.mocked(undoOperations.performUndo).mockResolvedValue(undefined);
    vi.mocked(undoOperations.performRedo).mockResolvedValue(undefined);
    vi.mocked(undoOperations.performHistoryGoTo).mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('performUndo calls undo-operations.performUndo', async () => {
    await performUndo(setState, getState);
    expect(undoOperations.performUndo).toHaveBeenCalledWith(setState, getState);
  });

  it('performRedo calls undo-operations.performRedo', async () => {
    await performRedo(setState, getState);
    expect(undoOperations.performRedo).toHaveBeenCalledWith(setState, getState);
  });

  it('performHistoryGoTo calls undo-operations.performHistoryGoTo with frameId', async () => {
    await performHistoryGoTo(setState, getState, 'frame-123');
    expect(undoOperations.performHistoryGoTo).toHaveBeenCalledWith(setState, getState, 'frame-123');
  });
});
