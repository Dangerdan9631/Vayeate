import type { UndoPersistenceAdapter } from './undo-stack-types';

/**
 * Enqueues a background job with a human-readable label for undo stack persistence.
 *
 * @param description Queue label shown for the persist job.
 * @param run Async work that writes the latest stack payload to disk.
 */
export type PersistEnqueueFn = (
  description: string,
  run: () => void | Promise<void>,
) => void;

interface PendingPersist {
  payload: string;
  cancelled: boolean;
  job: Promise<void>;
}

/**
 * Coalesces per-stack persist writes and exposes flush and cancel for release and shutdown.
 */
export interface UndoStackPersistScheduler {
  schedulePersist(stackId: string, adapter: UndoPersistenceAdapter, payload: string): void;
  flushPersist(stackId: string): Promise<void>;
  flushAll(): Promise<void>;
  cancelAll(): void;
}

/**
 * Creates a scheduler that batches rapid stack changes into one persist job per stack id.
 *
 * @param enqueue Background queue hook used to run persist work without blocking callers.
 * @returns A scheduler that coalesces payloads and supports flush and cancel.
 */
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
