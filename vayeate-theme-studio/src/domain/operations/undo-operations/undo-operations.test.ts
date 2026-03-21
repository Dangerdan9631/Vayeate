import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { container } from 'tsyringe';
import type { AppState } from '../../state/app-state';
import { initialAppState } from '../../state/app-state';
import { AppStateSetter } from '../../state/app-state-setter';
import { AppStateGetter } from '../../state/app-state-getter';
import {
  ClearPersistedUndo,
  PerformUndo,
  PerformRedo,
  PerformHistoryGoTo,
  setCurrentUndoStackId,
} from '.';
import { undoManagerV2 } from '../../core/undo-manager-v2';
import { UndoManagerV2Service } from '../../../gateway/services/undo-manager-v2-service';

vi.mock('../../core/undo-manager-v2', () => ({
  undoManagerV2: {
    getOrCreate: vi.fn(),
    configure: vi.fn(),
    clearPersisted: vi.fn().mockResolvedValue(undefined),
  },
}));

describe('undo-operations', () => {
  let setState: ReturnType<typeof vi.fn>;
  let appStateSetter: AppStateSetter;
  let getState: () => AppState;
  let appStateGetter: AppStateGetter;

  beforeEach(() => {
    setState = vi.fn();
    appStateSetter = new AppStateSetter(setState);
    getState = vi.fn(() => ({ ...initialAppState }));
    appStateGetter = new AppStateGetter(getState);
    vi.mocked(undoManagerV2.getOrCreate).mockResolvedValue({
      undo: vi.fn().mockReturnValue(false),
      redo: vi.fn().mockReturnValue(false),
      goto: vi.fn().mockReturnValue(false),
      list: vi.fn().mockReturnValue({ frames: [], currentId: null }),
      canUndo: false,
      canRedo: false,
    } as unknown as ReturnType<typeof undoManagerV2.getOrCreate> extends Promise<infer T> ? T : never);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('PerformUndo does nothing when currentUndoStackId is null', async () => {
    appStateGetter = new AppStateGetter(() => ({ ...initialAppState, undoStackId: { currentUndoStackId: null, undoListVersion: 0 } }));
    await new PerformUndo(appStateSetter, appStateGetter).execute();
    expect(undoManagerV2.getOrCreate).not.toHaveBeenCalled();
    expect(setState).not.toHaveBeenCalled();
  });

  it('PerformUndo calls getOrCreate and stack.undo when currentUndoStackId is set', async () => {
    const stack = {
      undo: vi.fn().mockReturnValue(true),
      redo: vi.fn().mockReturnValue(false),
      goto: vi.fn().mockReturnValue(false),
      list: vi.fn().mockReturnValue({ frames: [], currentId: null }),
      canUndo: false,
      canRedo: false,
    };
    vi.mocked(undoManagerV2.getOrCreate).mockResolvedValue(stack as never);
    appStateGetter = new AppStateGetter(() => ({
      ...initialAppState,
      undoStackId: { currentUndoStackId: 'stack-1', undoListVersion: 0 },
    }));
    await new PerformUndo(appStateSetter, appStateGetter).execute();
    expect(undoManagerV2.getOrCreate).toHaveBeenCalledWith('stack-1', expect.objectContaining({ processor: expect.any(Object) }));
    expect(stack.undo).toHaveBeenCalledTimes(1);
    expect(setState).toHaveBeenCalledWith({ type: 'SET_UNDO_LIST_VERSION', value: 1 });
  });

  it('PerformRedo does nothing when currentUndoStackId is null', async () => {
    await new PerformRedo(appStateSetter, appStateGetter).execute();
    expect(undoManagerV2.getOrCreate).not.toHaveBeenCalled();
  });

  it('PerformHistoryGoTo does nothing when currentUndoStackId is null', async () => {
    await new PerformHistoryGoTo(appStateSetter, appStateGetter).execute('frame-1');
    expect(undoManagerV2.getOrCreate).not.toHaveBeenCalled();
  });

  it('setCurrentUndoStackId calls setState with SET_CURRENT_UNDO_STACK_ID', () => {
    setCurrentUndoStackId(setState, 'new-stack');
    expect(setState).toHaveBeenCalledWith({ type: 'SET_CURRENT_UNDO_STACK_ID', stackId: 'new-stack' });
    setState.mockClear();
    setCurrentUndoStackId(setState, null);
    expect(setState).toHaveBeenCalledWith({ type: 'SET_CURRENT_UNDO_STACK_ID', stackId: null });
  });

  describe('ClearPersistedUndo', () => {
    const persistenceMock = {
      saveStack: vi.fn(),
      loadStack: vi.fn(),
      clearPersisted: vi.fn(),
    };

    beforeEach(() => {
      vi.mocked(undoManagerV2.clearPersisted).mockResolvedValue(undefined);
      container.registerInstance(UndoManagerV2Service, persistenceMock as unknown as UndoManagerV2Service);
    });

    it('execute configures and clears undoManagerV2', async () => {
      await container.resolve(ClearPersistedUndo).execute();
      expect(undoManagerV2.configure).toHaveBeenCalledWith({ persistence: persistenceMock });
      expect(undoManagerV2.clearPersisted).toHaveBeenCalledTimes(1);
    });
  });
});
