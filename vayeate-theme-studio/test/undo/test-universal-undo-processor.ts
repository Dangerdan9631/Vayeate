import { vi } from 'vitest';
import { ApplyCatalogUndoStateOperation } from '../../src/domain/operations/undo-operations/apply-catalog-undo-state-operation';
import { ApplyTemplateUndoStateOperation } from '../../src/domain/operations/undo-operations/apply-template-undo-state-operation';
import { ApplyThemeUndoStateOperation } from '../../src/domain/operations/undo-operations/apply-theme-undo-state-operation';
import { BuildUniversalUndoProcessorOperation } from '../../src/domain/operations/undo-operations/build-universal-undo-processor-operation';
import { HistoryGoToOperation } from '../../src/domain/operations/undo-operations/history-go-to-operation';
import { LoadUndoHistoryOperation } from '../../src/domain/operations/undo-operations/load-undo-history-operation';
import { RedoOperation } from '../../src/domain/operations/undo-operations/redo-operation';
import { SetCurrentUndoStackIdOperation } from '../../src/domain/operations/undo-operations/set-current-undo-stack-id-operation';
import { UndoOperation } from '../../src/domain/operations/undo-operations/undo-operation';
import type { UndoStackStore } from '../../src/domain/state/undo-stack/undo-stack-store';

export interface TestUniversalUndoProcessorDeps {
  applyCatalogUndoState: ApplyCatalogUndoStateOperation;
  applyTemplateUndoState: ApplyTemplateUndoStateOperation;
  applyThemeUndoState: ApplyThemeUndoStateOperation;
  commitAssignColorText?: { restore: (theme: never) => void };
  setColorVariableLight?: { execute: (ref: string | undefined, value: string) => unknown };
  setColorVariableDark?: { execute: (ref: string | undefined, value: string) => unknown };
  setHueAdjustment?: { execute: (value: number) => void };
  setHueReferenceHex?: { execute: (value: string) => void };
  setLoadedTemplate?: { execute: (template: unknown) => void };
}

export function createMinimalTestBuildUniversalUndoProcessor(): BuildUniversalUndoProcessorOperation {
  return {
    execute: () => ({
      applyProcessor: vi.fn(),
      revertProcessor: vi.fn(),
      handlerCount: 1,
    }),
  } as never;
}

export function createTestBuildUniversalUndoProcessor(
  deps: TestUniversalUndoProcessorDeps,
): BuildUniversalUndoProcessorOperation {
  return new BuildUniversalUndoProcessorOperation(
    deps.applyCatalogUndoState,
    deps.applyTemplateUndoState,
    deps.applyThemeUndoState,
    (deps.commitAssignColorText ?? { restore: () => undefined }) as never,
    (deps.setColorVariableLight ?? { execute: () => null }) as never,
    (deps.setColorVariableDark ?? { execute: () => null }) as never,
    (deps.setHueAdjustment ?? { execute: () => undefined }) as never,
    (deps.setHueReferenceHex ?? { execute: () => undefined }) as never,
    (deps.setLoadedTemplate ?? { execute: () => undefined }) as never,
  );
}

export function createTestUndoOperations(
  undoStackStore: UndoStackStore,
  buildUniversalUndoProcessor: BuildUniversalUndoProcessorOperation,
) {
  return {
    buildUniversalUndoProcessor,
    setCurrentUndoStackId: new SetCurrentUndoStackIdOperation(undoStackStore, buildUniversalUndoProcessor),
    loadUndoHistory: new LoadUndoHistoryOperation(undoStackStore, buildUniversalUndoProcessor),
    undo: new UndoOperation(undoStackStore, buildUniversalUndoProcessor),
    redo: new RedoOperation(undoStackStore, buildUniversalUndoProcessor),
    historyGoTo: new HistoryGoToOperation(undoStackStore, buildUniversalUndoProcessor),
  };
}
