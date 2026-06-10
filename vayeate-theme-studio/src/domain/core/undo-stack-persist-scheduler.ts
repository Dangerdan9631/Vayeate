import type { UndoPersistenceAdapter } from './undo-stack-types';

export type PersistEnqueueFn = (
  description: string,
  run: () => void | Promise<void>,
) => void;

interface PendingPersist {
  payload: string;
  cancelled: boolean;
  job: Promise<void>;
}

export interface UndoStackPersistScheduler {
  schedulePersist(stackId: string, adapter: UndoPersistenceAdapter, payload: string): void;
  flushPersist(stackId: string): Promise<void>;
  flushAll(): Promise<void>;
  cancelAll(): void;
}

export function createUndoStackPersistScheduler(enqueue: PersistEnqueueFn): UndoStackPersistScheduler {
  const pendingByStackId = new Map<string, PendingPersist>();

  async function runPersistJob(stackId: string, adapter: UndoPersistenceAdapter, entry: PendingPersist): Promise<void> {
    while (true) {
      if (entry.cancelled) {
        return;
      }

      const payloadToWrite = entry.payload;
      await adapter.saveStack(stackId, payloadToWrite);

      if (entry.cancelled) {
        return;
      }
      if (entry.payload === payloadToWrite) {
        return;
      }
    }
  }

  function ensurePending(stackId: string, payload: string, adapter: UndoPersistenceAdapter): void {
    const existing = pendingByStackId.get(stackId);
    if (existing) {
      existing.payload = payload;
      return;
    }

    let resolveJob!: () => void;
    let rejectJob!: (error: unknown) => void;
    const job = new Promise<void>((resolve, reject) => {
      resolveJob = resolve;
      rejectJob = reject;
    });

    const entry: PendingPersist = {
      payload,
      cancelled: false,
      job,
    };
    pendingByStackId.set(stackId, entry);

    enqueue(`Persist undo stack ${stackId}`, async () => {
      try {
        await runPersistJob(stackId, adapter, entry);
        resolveJob();
      } catch (error) {
        rejectJob(error);
        throw error;
      } finally {
        pendingByStackId.delete(stackId);
      }
    });
  }

  return {
    schedulePersist(stackId, adapter, payload) {
      ensurePending(stackId, payload, adapter);
    },

    async flushPersist(stackId) {
      const entry = pendingByStackId.get(stackId);
      if (entry) {
        await entry.job;
      }
    },

    async flushAll() {
      await Promise.all([...pendingByStackId.values()].map((entry) => entry.job));
    },

    cancelAll() {
      for (const entry of pendingByStackId.values()) {
        entry.cancelled = true;
      }
      pendingByStackId.clear();
    },
  };
}
