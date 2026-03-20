import { describe, expect, it, vi } from 'vitest';
import type { PerformUndo, PerformRedo, PerformHistoryGoTo, SetCurrentUndoStackId } from '../../operations/undo-operations';
import { PerformUndoController, PerformRedoController, PerformHistoryGoToController, ResetCurrentUndoStackIdController } from '.';

describe('undo-controller', () => {
  describe('PerformUndoController', () => {
    it('run delegates to PerformUndo.execute', async () => {
      const execute = vi.fn().mockResolvedValue(undefined);
      const op = { execute } as unknown as PerformUndo;
      await new PerformUndoController(op).run();
      expect(execute).toHaveBeenCalledTimes(1);
    });
  });

  describe('PerformRedoController', () => {
    it('run delegates to PerformRedo.execute', async () => {
      const execute = vi.fn().mockResolvedValue(undefined);
      const op = { execute } as unknown as PerformRedo;
      await new PerformRedoController(op).run();
      expect(execute).toHaveBeenCalledTimes(1);
    });
  });

  describe('PerformHistoryGoToController', () => {
    it('run delegates to PerformHistoryGoTo.execute with frameId', async () => {
      const execute = vi.fn().mockResolvedValue(undefined);
      const op = { execute } as unknown as PerformHistoryGoTo;
      await new PerformHistoryGoToController(op).run('frame-123');
      expect(execute).toHaveBeenCalledWith('frame-123');
    });
  });

  describe('ResetCurrentUndoStackIdController', () => {
    it('run delegates to SetCurrentUndoStackId.execute with null', () => {
      const execute = vi.fn();
      const op = { execute } as unknown as SetCurrentUndoStackId;
      new ResetCurrentUndoStackIdController(op).run();
      expect(execute).toHaveBeenCalledWith(null);
    });
  });
});
