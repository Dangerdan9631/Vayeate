import type { UndoPersistenceAdapter } from '../../core/undo-stack-types';

/**
 * Abstraction for undo persistence consumed by domain operations.
 */

export abstract class UndoPersistencePort implements UndoPersistenceAdapter {

  /**
   * Runs save stack for undo persistence.
   * @param stackId Stack id (string).
   * @param payload Payload (string).
   * @returns Promise resolving to void.
   */
  abstract saveStack(stackId: string, payload: string): Promise<void>;

  /**
   * Runs load stack for undo persistence.
   * @param stackId Stack id (string).
   * @returns Promise resolving to string | null.
   */
  abstract loadStack(stackId: string): Promise<string | null>;

  /**
   * Runs clear persisted for undo persistence.
   * @returns Promise resolving to void.
   */
  abstract clearPersisted(): Promise<void>;
}

