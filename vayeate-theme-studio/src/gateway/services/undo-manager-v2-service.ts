/**
 * Renderer-side service for UndoManagerV2 persistence via IPC.
 */

export const undoManagerV2Service = {
  async saveStack(stackId: string, payload: string): Promise<void> {
    await window.electronAPI?.undoV2Save?.(stackId, payload);
  },

  async loadStack(stackId: string): Promise<string | null> {
    if (!window.electronAPI?.undoV2Load) return null;
    return window.electronAPI.undoV2Load(stackId);
  },

  async clearPersisted(): Promise<void> {
    await window.electronAPI?.undoV2ClearPersisted?.();
  },
};
