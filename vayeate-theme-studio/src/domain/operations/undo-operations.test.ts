import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { AppState } from '../state/app-state';
import {
  clearPersistedUndo,
  performUndo,
  performRedo,
  performHistoryGoTo,
  setCurrentUndoStackId,
} from './undo-operations';
import { undoManagerV2 } from '../utils/undo-manager-v2';

vi.mock('../utils/undo-manager-v2', () => ({
  undoManagerV2: {
    getOrCreate: vi.fn(),
    configure: vi.fn(),
    clearPersisted: vi.fn().mockResolvedValue(undefined),
  },
}));

const initialAppState: AppState = {
  activeTab: 'catalogs',
  catalogs: {
    catalogRefs: [],
    selectedRef: null,
    catalog: null,
    loadedForDisplay: {},
    isCreating: false,
    createDialogOpen: false,
    createFormName: '',
    createFormType: 'manual',
    bulkAddDialogOpen: false,
    bulkAddText: '',
    tokensSearchText: '',
    newSourceUrl: '',
    newSourceTokenType: 'theme',
    newSourceType: 'default',
    newTokenKey: '',
  },
  templates: {
    templateRefs: [],
    selectedRef: null,
    template: null,
    isCreating: false,
    createDialogOpen: false,
    createFormName: '',
    mappingSearchText: '',
    mappingColorVariableFilter: [],
    mappingContrastVariableFilter: [],
    mappingTokenGroupSelection: '',
    variablesSearchText: '',
  },
  themes: {
    themeRefs: [],
    selectedRef: null,
    theme: null,
    checkedColorRefs: [],
    checkedContrastRefs: [],
    hueAdjustment: 0,
    hueReferenceHex: '#FF0000',
    isCreating: false,
    createDialogOpen: false,
    createFormName: '',
    generateResult: null,
    saveError: null,
    assignColorDraftText: '',
    themeVariablesSearchText: '',
    previewVariableFilterText: '',
    selectedPreviewSampleKey: '',
  },
  queueStatus: { isProcessing: false, queueLength: 0 },
  undoStackId: { currentUndoStackId: null, undoListVersion: 0 },
};

describe('undo-operations', () => {
  let setState: ReturnType<typeof vi.fn>;
  let getState: () => AppState;

  beforeEach(() => {
    setState = vi.fn();
    getState = vi.fn(() => ({ ...initialAppState }));
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

  it('performUndo does nothing when currentUndoStackId is null', async () => {
    getState = vi.fn(() => ({ ...initialAppState, undoStackId: { currentUndoStackId: null, undoListVersion: 0 } }));
    await performUndo(setState, getState);
    expect(undoManagerV2.getOrCreate).not.toHaveBeenCalled();
    expect(setState).not.toHaveBeenCalled();
  });

  it('performUndo calls getOrCreate and stack.undo when currentUndoStackId is set', async () => {
    const stack = {
      undo: vi.fn().mockReturnValue(true),
      redo: vi.fn().mockReturnValue(false),
      goto: vi.fn().mockReturnValue(false),
      list: vi.fn().mockReturnValue({ frames: [], currentId: null }),
      canUndo: false,
      canRedo: false,
    };
    vi.mocked(undoManagerV2.getOrCreate).mockResolvedValue(stack as never);
    getState = vi.fn(() => ({
      ...initialAppState,
      undoStackId: { currentUndoStackId: 'stack-1', undoListVersion: 0 },
    }));
    await performUndo(setState, getState);
    expect(undoManagerV2.getOrCreate).toHaveBeenCalledWith('stack-1', expect.objectContaining({ processor: expect.any(Object) }));
    expect(stack.undo).toHaveBeenCalledTimes(1);
    expect(setState).toHaveBeenCalledWith({ type: 'SET_UNDO_LIST_VERSION', value: 1 });
  });

  it('performRedo does nothing when currentUndoStackId is null', async () => {
    getState = vi.fn(() => ({ ...initialAppState }));
    await performRedo(setState, getState);
    expect(undoManagerV2.getOrCreate).not.toHaveBeenCalled();
  });

  it('performHistoryGoTo does nothing when currentUndoStackId is null', async () => {
    getState = vi.fn(() => ({ ...initialAppState }));
    await performHistoryGoTo(setState, getState, 'frame-1');
    expect(undoManagerV2.getOrCreate).not.toHaveBeenCalled();
  });

  it('setCurrentUndoStackId calls setState with SET_CURRENT_UNDO_STACK_ID', () => {
    setCurrentUndoStackId(setState, 'new-stack');
    expect(setState).toHaveBeenCalledWith({ type: 'SET_CURRENT_UNDO_STACK_ID', stackId: 'new-stack' });
    setState.mockClear();
    setCurrentUndoStackId(setState, null);
    expect(setState).toHaveBeenCalledWith({ type: 'SET_CURRENT_UNDO_STACK_ID', stackId: null });
  });

  describe('clearPersistedUndo', () => {
    beforeEach(() => {
      vi.mocked(undoManagerV2.clearPersisted).mockResolvedValue(undefined);
    });

    it('configures and clears undoManagerV2', async () => {
      await clearPersistedUndo();
      expect(undoManagerV2.configure).toHaveBeenCalledTimes(1);
      expect(undoManagerV2.clearPersisted).toHaveBeenCalledTimes(1);
    });
  });
});
