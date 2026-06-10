import type { UndoPersistenceAdapter } from '../../core/undo-stack-types';

export abstract class UndoPersistencePort implements UndoPersistenceAdapter {
  abstract saveStack(stackId: string, payload: string): Promise<void>;
  abstract loadStack(stackId: string): Promise<string | null>;
  abstract clearPersisted(): Promise<void>;
}

