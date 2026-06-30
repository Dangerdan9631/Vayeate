import { expect, vi } from 'vitest';
import type { BackgroundQueueContinuation } from '../../src/model/background-queue';
import type { CatalogsStore } from '../../src/domain/catalog/state/catalogs-store';
import type { TemplatesStore } from '../../src/domain/state/data/templates-store';
import type { ThemesStore } from '../../src/domain/state/data/themes-store';
import type { UndoStackStore } from '../../src/domain/state/undo-stack/undo-stack-store';
import { ApplyCatalogLifecycleUndoOperation } from '../../src/domain/operations/undo-operations/apply-catalog-lifecycle-undo-operation';
import { ApplyCatalogUndoStateOperation } from '../../src/domain/operations/undo-operations/apply-catalog-undo-state-operation';
import { ApplyCatalogSourceUrlUndoOperation } from '../../src/domain/operations/undo-operations/apply-catalog-source-url-undo-operation';
import { ApplyTemplateLifecycleUndoOperation } from '../../src/domain/operations/undo-operations/apply-template-lifecycle-undo-operation';
import { ApplyTemplateUndoStateOperation } from '../../src/domain/operations/undo-operations/apply-template-undo-state-operation';
import { ApplyThemeLifecycleUndoOperation } from '../../src/domain/operations/undo-operations/apply-theme-lifecycle-undo-operation';
import { ApplyThemeUndoStateOperation } from '../../src/domain/operations/undo-operations/apply-theme-undo-state-operation';
import { BuildUniversalUndoProcessorOperation } from '../../src/domain/operations/undo-operations/build-universal-undo-processor-operation';
import { HistoryGoToOperation } from '../../src/domain/operations/undo-operations/history-go-to-operation';
import { LoadUndoHistoryOperation } from '../../src/domain/operations/undo-operations/load-undo-history-operation';
import { RedoOperation } from '../../src/domain/operations/undo-operations/redo-operation';
import { RestoreThemePaletteAssignUndoOperation } from '../../src/domain/operations/undo-operations/restore-theme-palette-assign-undo-operation';
import { EnqueueBackgroundQueueActionOperation } from '../../src/domain/operations/background-queue/enqueue-background-queue-action-operation';
import { SetCurrentUndoStackIdOperation } from '../../src/domain/operations/undo-operations/set-current-undo-stack-id-operation';
import { UndoOperation } from '../../src/domain/operations/undo-operations/undo-operation';

export function syncContinuation(run: () => void | Promise<void> = () => undefined): BackgroundQueueContinuation {
  const continuation: BackgroundQueueContinuation = {
    onQueue: () => continuation,
    then: (_label, cb) => {
      void Promise.resolve(run()).then(() => cb());
    },
  };
  return continuation;
}

export function createSyncBackgroundQueue() {
  const pendingRuns: Array<() => void | Promise<void>> = [];
  const queue = {
    pendingRuns,
    execute: vi.fn((_type: string, _label: string, fn: () => void | Promise<void>) => {
      pendingRuns.push(fn);
      return syncContinuation(fn);
    }),
    executeReturning: vi.fn(async (_label: string, fn: () => unknown) => fn()),
    async flush(): Promise<void> {
      while (pendingRuns.length > 0) {
        const run = pendingRuns.shift()!;
        await run();
      }
    },
  };
  return queue;
}

export function removeCatalogVersion(catalogsStore: CatalogsStore, name: string, version: string): void {
  catalogsStore.api.setState((draft) => {
    if (!draft.state.catalogs[name]) return;
    delete draft.state.catalogs[name][version];
    if (Object.keys(draft.state.catalogs[name]).length === 0) {
      delete draft.state.catalogs[name];
    }
  });
}

export function removeTemplateVersion(templatesStore: TemplatesStore, name: string, version: string): void {
  templatesStore.api.setState((draft) => {
    if (!draft.state.templates[name]) return;
    delete draft.state.templates[name][version];
    if (Object.keys(draft.state.templates[name]).length === 0) {
      delete draft.state.templates[name];
    }
  });
}

export function removeThemeVersion(themesStore: ThemesStore, name: string, version: string): void {
  themesStore.api.setState((draft) => {
    if (!draft.state.themeMap[name]) return;
    delete draft.state.themeMap[name][version];
    if (Object.keys(draft.state.themeMap[name]).length === 0) {
      delete draft.state.themeMap[name];
    }
  });
}

export async function waitForUndoRecorded(undoStackStore: UndoStackStore): Promise<void> {
  await vi.waitFor(() => {
    expect(undoStackStore.getStore().state.undoMenu?.canUndo).toBe(true);
  });
}

export interface TestUniversalUndoProcessorDeps {
  applyCatalogUndoState: ApplyCatalogUndoStateOperation;
  applyCatalogLifecycleUndo?: ApplyCatalogLifecycleUndoOperation;
  applyCatalogSourceUrlUndo?: ApplyCatalogSourceUrlUndoOperation;
  applyTemplateLifecycleUndo?: ApplyTemplateLifecycleUndoOperation;
  applyTemplateUndoState: ApplyTemplateUndoStateOperation;
  applyThemeLifecycleUndo?: ApplyThemeLifecycleUndoOperation;
  applyThemeUndoState: ApplyThemeUndoStateOperation;
  restorePaletteAssignUndo?: RestoreThemePaletteAssignUndoOperation;
  setColorVariableLight?: { execute: (ref: string | undefined, value: string) => unknown };
  setColorVariableDark?: { execute: (ref: string | undefined, value: string) => unknown };
  setContrastVariableField?: { execute: (...args: unknown[]) => unknown };
  setContrastUseDarkForLight?: { execute: (ref: string | undefined, checked: boolean) => unknown };
  setColorUseDarkForLight?: { execute: (ref: string | undefined, checked: boolean) => unknown };
  setApplyPaletteToLight?: { execute: (checked: boolean) => unknown };
  setApplyPaletteToDark?: { execute: (checked: boolean) => unknown };
  setPaletteClusterCount?: { execute: (value: number) => unknown };
  setPreviewTokenRefField?: { execute: (field: string, value: string | null) => unknown };
  setHueAdjustment?: { execute: (value: number) => void };
  setSaturationAdjustment?: { execute: (value: number) => void };
  setValueAdjustment?: { execute: (value: number) => void };
  setHueReferenceHex?: { execute: (value: string) => void };
  setThemePaneSelections?: { execute: (checkedColorRefs: string[], checkedContrastRefs: string[]) => void };
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
    (deps.applyCatalogLifecycleUndo ?? {
      applyVersionDeleted: () => undefined,
      revertVersionDeleted: () => undefined,
      applyCreated: () => undefined,
      revertCreated: () => undefined,
      applyRevertedToVersion: () => undefined,
      revertRevertedToVersion: () => undefined,
    }) as never,
    (deps.applyCatalogSourceUrlUndo ?? { execute: () => undefined }) as never,
    (deps.applyTemplateLifecycleUndo ?? {
      applyVersionDeleted: () => undefined,
      revertVersionDeleted: () => undefined,
      applyCreated: () => undefined,
      revertCreated: () => undefined,
    }) as never,
    deps.applyTemplateUndoState,
    (deps.applyThemeLifecycleUndo ?? {
      applyVersionDeleted: () => undefined,
      revertVersionDeleted: () => undefined,
      applyVersionIncremented: () => undefined,
      revertVersionIncremented: () => undefined,
      applyCreated: () => undefined,
      revertCreated: () => undefined,
    }) as never,
    deps.applyThemeUndoState,
    (deps.restorePaletteAssignUndo ?? { execute: () => undefined }) as never,
    (deps.setColorVariableLight ?? { execute: () => null }) as never,
    (deps.setColorVariableDark ?? { execute: () => null }) as never,
    (deps.setContrastVariableField ?? { execute: () => null }) as never,
    (deps.setContrastUseDarkForLight ?? { execute: () => null }) as never,
    (deps.setColorUseDarkForLight ?? { execute: () => null }) as never,
    (deps.setApplyPaletteToLight ?? { execute: () => null }) as never,
    (deps.setApplyPaletteToDark ?? { execute: () => null }) as never,
    (deps.setPaletteClusterCount ?? { execute: () => null }) as never,
    (deps.setPreviewTokenRefField ?? { execute: () => null }) as never,
    (deps.setHueAdjustment ?? { execute: () => undefined }) as never,
    (deps.setSaturationAdjustment ?? { execute: () => undefined }) as never,
    (deps.setValueAdjustment ?? { execute: () => undefined }) as never,
    (deps.setHueReferenceHex ?? { execute: () => undefined }) as never,
    (deps.setThemePaneSelections ?? { execute: () => undefined }) as never,
    (deps.setLoadedTemplate ?? { execute: () => undefined }) as never,
  );
}

export function createTestUndoOperations(
  undoStackStore: UndoStackStore,
  buildUniversalUndoProcessor: BuildUniversalUndoProcessorOperation,
  backgroundQueue = createSyncBackgroundQueue(),
) {
  return {
    backgroundQueue,
    buildUniversalUndoProcessor,
    setCurrentUndoStackId: new SetCurrentUndoStackIdOperation(
      undoStackStore,
      buildUniversalUndoProcessor,
      backgroundQueue as unknown as EnqueueBackgroundQueueActionOperation,
    ),
    loadUndoHistory: new LoadUndoHistoryOperation(undoStackStore, buildUniversalUndoProcessor),
    undo: new UndoOperation(undoStackStore, buildUniversalUndoProcessor),
    redo: new RedoOperation(undoStackStore, buildUniversalUndoProcessor),
    historyGoTo: new HistoryGoToOperation(undoStackStore, buildUniversalUndoProcessor),
  };
}
