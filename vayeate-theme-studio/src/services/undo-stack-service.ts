export type UndoPane = 'themes' | 'templates' | 'catalogs';

export const undoStackService = {
  async save(pane: UndoPane, docId: string, payload: string): Promise<void> {
    await window.electronAPI?.undoSave?.(pane, docId, payload);
  },

  async load(pane: UndoPane, docId: string): Promise<string | null> {
    if (!window.electronAPI?.undoLoad) return null;
    return window.electronAPI.undoLoad(pane, docId);
  },

  async clearAll(): Promise<void> {
    await window.electronAPI?.undoClearAll?.();
  },
};
