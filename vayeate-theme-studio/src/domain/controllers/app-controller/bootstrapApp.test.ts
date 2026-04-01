import { describe, it, expect, vi } from 'vitest';
import { BootstrapAppController } from './bootstrapApp';
import type { InitializeWindowService, LoadAppConfig, TearDownWindowService } from '../../operations/app-operations';
import type { ClearPersistedUndo } from '../../operations/undo-operations';
import type { LoadCatalogRefs } from '../../operations/catalog-operations';
import type { LoadTemplateRefs } from '../../operations/template-operations';
import type { LoadThemeRefs } from '../../operations/theme-operations';

describe('BootstrapAppController', () => {
  it('run loads app ops, initializes window listeners, and teardown tears down window service', () => {
    const clearPersistedUndo = { execute: vi.fn().mockResolvedValue(undefined) };
    const loadAppConfig = { execute: vi.fn().mockResolvedValue(undefined) };
    const loadCatalogRefs = { execute: vi.fn().mockResolvedValue(undefined) };
    const loadTemplateRefs = { execute: vi.fn().mockResolvedValue(undefined) };
    const loadThemeRefs = { execute: vi.fn().mockResolvedValue(undefined) };
    const initializeWindowService = { execute: vi.fn() };
    const tearDownWindowService = { execute: vi.fn() };
    const controller = new BootstrapAppController(
      clearPersistedUndo as unknown as ClearPersistedUndo,
      loadAppConfig as unknown as LoadAppConfig,
      loadCatalogRefs as unknown as LoadCatalogRefs,
      loadTemplateRefs as unknown as LoadTemplateRefs,
      loadThemeRefs as unknown as LoadThemeRefs,
      initializeWindowService as unknown as InitializeWindowService,
      tearDownWindowService as unknown as TearDownWindowService,
    );

    const teardown = controller.run();

    expect(clearPersistedUndo.execute).toHaveBeenCalledTimes(1);
    expect(loadAppConfig.execute).toHaveBeenCalledTimes(1);
    expect(loadCatalogRefs.execute).toHaveBeenCalledTimes(1);
    expect(loadTemplateRefs.execute).toHaveBeenCalledTimes(1);
    expect(loadThemeRefs.execute).toHaveBeenCalledTimes(1);
    expect(initializeWindowService.execute).toHaveBeenCalledTimes(1);
    expect(tearDownWindowService.execute).not.toHaveBeenCalled();

    teardown();

    expect(tearDownWindowService.execute).toHaveBeenCalledTimes(1);
  });
});
