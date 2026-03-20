import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { LoadCatalogRefs } from '../../operations/catalog-operations';
import type { LoadTemplateRefs } from '../../operations/template-operations';
import type { LoadThemeRefs } from '../../operations/theme-operations';
import type { ClearPersistedUndo } from '../../operations/undo-operations';
import { UnloadApplication } from '../../operations/app-operations';
import { LoadApplicationController, UnloadApplicationController } from '.';

vi.mock('../../operations/catalog-operations', () => ({ LoadCatalogRefs: vi.fn() }));
vi.mock('../../operations/template-operations', () => ({ LoadTemplateRefs: vi.fn() }));
vi.mock('../../operations/theme-operations', () => ({ LoadThemeRefs: vi.fn() }));

describe('app-controller', () => {
  let clearPersistedUndo: ClearPersistedUndo;
  let loadCatalogRefs: LoadCatalogRefs;
  let loadTemplateRefs: LoadTemplateRefs;
  let loadThemeRefs: LoadThemeRefs;

  beforeEach(() => {
    clearPersistedUndo = { execute: vi.fn().mockResolvedValue(undefined) } as unknown as ClearPersistedUndo;
    loadCatalogRefs = { execute: vi.fn().mockResolvedValue(undefined) } as unknown as LoadCatalogRefs;
    loadTemplateRefs = { execute: vi.fn().mockResolvedValue(undefined) } as unknown as LoadTemplateRefs;
    loadThemeRefs = { execute: vi.fn().mockResolvedValue(undefined) } as unknown as LoadThemeRefs;
  });

  it('LoadApplicationController run composes operations and resolves', async () => {
    const controller = new LoadApplicationController(clearPersistedUndo, loadCatalogRefs, loadTemplateRefs, loadThemeRefs);
    await expect(controller.run()).resolves.toBeUndefined();
  });

  it('LoadApplicationController run calls ClearPersistedUndo.execute', async () => {
    const controller = new LoadApplicationController(clearPersistedUndo, loadCatalogRefs, loadTemplateRefs, loadThemeRefs);
    await controller.run();
    expect(clearPersistedUndo.execute).toHaveBeenCalledTimes(1);
  });

  it('LoadApplicationController run calls load refs operations', async () => {
    const controller = new LoadApplicationController(clearPersistedUndo, loadCatalogRefs, loadTemplateRefs, loadThemeRefs);
    await controller.run();
    expect(loadCatalogRefs.execute).toHaveBeenCalledTimes(1);
    expect(loadTemplateRefs.execute).toHaveBeenCalledTimes(1);
    expect(loadThemeRefs.execute).toHaveBeenCalledTimes(1);
  });

  it('UnloadApplicationController run calls UnloadApplication.execute', async () => {
    const unloadOp = { execute: vi.fn().mockResolvedValue(undefined) } as unknown as UnloadApplication;
    const controller = new UnloadApplicationController(unloadOp);
    await expect(controller.run()).resolves.toBeUndefined();
    expect(unloadOp.execute).toHaveBeenCalledTimes(1);
  });
});
