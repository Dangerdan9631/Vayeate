import { describe, expect, it, vi } from 'vitest';
import { CatalogActionHandler } from './actions/catalog-handler';
import { CatalogPageHandler } from './catalog-page/actions/catalog-page-handler';
import { CatalogPageActionType } from './catalog-page/actions/catalog-page-action-type';
import { CatalogsCardHandler } from './catalogs-card/actions/catalogs-card-handler';
import { CatalogsCardActionType } from './catalogs-card/actions/catalogs-card-action-type';
import { CatalogDetailsCardHandler } from './catalog-details-card/actions/catalog-details-card-handler';
import { CatalogDetailsCardActionType } from './catalog-details-card/actions/catalog-details-card-action-type';
import { TokensCardHandler } from './tokens-card/actions/tokens-card-handler';
import { TokensCardActionType } from './tokens-card/actions/tokens-card-action-type';
import { LoadCatalogPageController } from './catalog-page/controllers/load-catalog-page-controller';
import { SetSelectedCatalogController } from './catalogs-card/controllers/set-selected-catalog-controller';
import { OpenCatalogCreateDialogController } from './create-dialog/controllers/open-catalog-create-dialog-controller';
import type { LoggerFactory } from '../../domain/utils/logger';

function createLoggerFactory(): LoggerFactory {
  return {
    create: () => ({
      debug: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      category: 'test',
    }),
  } as unknown as LoggerFactory;
}

describe('catalog flow routing', () => {
  it('runs the page load controller only for page load actions', () => {
    const loadCatalogPage = { run: vi.fn() };
    const handler = new CatalogPageHandler(loadCatalogPage as never, createLoggerFactory());

    handler.handle({ type: CatalogPageActionType.PageOnLoad });

    expect(loadCatalogPage.run).toHaveBeenCalledTimes(1);
  });

  it('routes catalog card actions to selection and create controllers', () => {
    const setSelectedCatalog = { run: vi.fn() };
    const openCatalogCreateDialog = { run: vi.fn() };
    const handler = new CatalogsCardHandler(
      setSelectedCatalog as never,
      openCatalogCreateDialog as never,
      createLoggerFactory(),
    );

    handler.handle({
      type: CatalogsCardActionType.CatalogsListOnCommit,
      name: 'catalog-a',
      version: '1.0.0',
    });
    handler.handle({
      type: CatalogsCardActionType.CatalogVersionsListOnCommit,
      name: 'catalog-a',
      version: '1.0.1',
    });
    handler.handle({
      type: CatalogsCardActionType.CatalogsCreateButtonOnClick,
    });

    expect(setSelectedCatalog.run).toHaveBeenNthCalledWith(1, 'catalog-a', '1.0.0');
    expect(setSelectedCatalog.run).toHaveBeenNthCalledWith(2, 'catalog-a', '1.0.1');
    expect(openCatalogCreateDialog.run).toHaveBeenCalledTimes(1);
  });

  it('routes catalog detail and token actions to the expected controllers', async () => {
    const detailDeps = {
      updateSourceUrl: { run: vi.fn() },
      updateSourceTokenType: { run: vi.fn() },
      updateSourceType: { run: vi.fn() },
      removeSource: { run: vi.fn() },
      setCatalogNewSourceUrl: { run: vi.fn() },
      setCatalogNewSourceTokenType: { run: vi.fn() },
      setCatalogNewSourceType: { run: vi.fn() },
      addNewSource: { run: vi.fn() },
      deleteCurrentCatalogVersion: { run: vi.fn(async () => {}) },
      syncCatalog: { run: vi.fn(async () => {}) },
      lockCatalog: { run: vi.fn() },
      revertCatalogToVersion: { run: vi.fn(async () => {}) },
    };
    const detailsHandler = new CatalogDetailsCardHandler(
      detailDeps.updateSourceUrl as never,
      detailDeps.updateSourceTokenType as never,
      detailDeps.updateSourceType as never,
      detailDeps.removeSource as never,
      detailDeps.setCatalogNewSourceUrl as never,
      detailDeps.setCatalogNewSourceTokenType as never,
      detailDeps.setCatalogNewSourceType as never,
      detailDeps.addNewSource as never,
      detailDeps.deleteCurrentCatalogVersion as never,
      detailDeps.syncCatalog as never,
      detailDeps.lockCatalog as never,
      detailDeps.revertCatalogToVersion as never,
      createLoggerFactory(),
    );

    await detailsHandler.handle({
      type: CatalogDetailsCardActionType.SourceUrlTextOnCommit,
      sourceIndex: 0,
      value: 'https://example.test',
    });
    await detailsHandler.handle({
      type: CatalogDetailsCardActionType.NewSourceAddButtonOnClick,
    });
    await detailsHandler.handle({
      type: CatalogDetailsCardActionType.SyncButtonOnClick,
    });

    expect(detailDeps.updateSourceUrl.run).toHaveBeenCalledWith(0, 'https://example.test');
    expect(detailDeps.addNewSource.run).toHaveBeenCalledTimes(1);
    expect(detailDeps.syncCatalog.run).toHaveBeenCalledTimes(1);

    const tokenDeps = {
      setCatalogTokensSearchText: { run: vi.fn() },
      openBulkAddDialog: { run: vi.fn() },
      updateTokenKey: { run: vi.fn() },
      removeToken: { run: vi.fn() },
      setCatalogNewTokenKey: { run: vi.fn() },
      addNewToken: { run: vi.fn() },
      setCatalogNewSemanticTokenSelectorText: { run: vi.fn() },
      addCatalogSemanticTokenSelector: { run: vi.fn() },
      updateSemanticTokenRegistryText: { run: vi.fn() },
      removeSemanticTokenListItem: { run: vi.fn() },
    };
    const tokensHandler = new TokensCardHandler(
      tokenDeps.setCatalogTokensSearchText as never,
      tokenDeps.openBulkAddDialog as never,
      tokenDeps.updateTokenKey as never,
      tokenDeps.removeToken as never,
      tokenDeps.setCatalogNewTokenKey as never,
      tokenDeps.addNewToken as never,
      tokenDeps.setCatalogNewSemanticTokenSelectorText as never,
      tokenDeps.addCatalogSemanticTokenSelector as never,
      tokenDeps.updateSemanticTokenRegistryText as never,
      tokenDeps.removeSemanticTokenListItem as never,
      createLoggerFactory(),
    );

    tokensHandler.handle({
      type: TokensCardActionType.NewTokenAddButtonOnClick,
      tokenType: 'theme',
      key: 'editor.foreground',
    });
    tokensHandler.handle({
      type: TokensCardActionType.ExistingSemanticTokenRemoveButtonOnClick,
      registryList: 'types',
      index: 0,
    });

    expect(tokenDeps.addNewToken.run).toHaveBeenCalledWith('theme', 'editor.foreground');
    expect(tokenDeps.removeSemanticTokenListItem.run).toHaveBeenCalledWith('types', 0);
  });

  it('dispatches top-level catalog actions to the matching sub-handler', async () => {
    const deps = {
      catalogPageHandler: { handle: vi.fn() },
      catalogCreateDialogHandler: { handle: vi.fn() },
      catalogsCardHandler: { handle: vi.fn() },
      catalogBulkAddDialogHandler: { handle: vi.fn() },
      catalogDetailsCardHandler: { handle: vi.fn() },
      tokensCardHandler: { handle: vi.fn() },
    };
    const handler = new CatalogActionHandler(
      createLoggerFactory(),
      deps.catalogPageHandler as never,
      deps.catalogCreateDialogHandler as never,
      deps.catalogsCardHandler as never,
      deps.catalogBulkAddDialogHandler as never,
      deps.catalogDetailsCardHandler as never,
      deps.tokensCardHandler as never,
    );

    await handler.handle({ type: CatalogPageActionType.PageOnLoad });
    await handler.handle({
      type: CatalogsCardActionType.CatalogsCreateButtonOnClick,
    });
    await handler.handle({
      type: TokensCardActionType.SearchTextOnChange,
      value: 'editor',
    });

    expect(deps.catalogPageHandler.handle).toHaveBeenCalledTimes(1);
    expect(deps.catalogsCardHandler.handle).toHaveBeenCalledTimes(1);
    expect(deps.tokensCardHandler.handle).toHaveBeenCalledTimes(1);
  });

  it('keeps thin controllers focused on single operation dispatch', () => {
    const loadCatalogRefs = { execute: vi.fn() };
    const catalogUiStore = {
      getStore: () => ({ state: { pageLoadState: 'unloaded' } }),
    };
    const loadCatalogPage = new LoadCatalogPageController(
      loadCatalogRefs as never,
      catalogUiStore as never,
    );
    loadCatalogPage.run();
    expect(loadCatalogRefs.execute).toHaveBeenCalledTimes(1);

    const setSelectedCatalog = { execute: vi.fn() };
    const selectController = new SetSelectedCatalogController(setSelectedCatalog as never);
    selectController.run('catalog-a', '1.0.0');
    expect(setSelectedCatalog.execute).toHaveBeenCalledWith({
      name: 'catalog-a',
      version: '1.0.0',
    });

    const openCreateDialog = { execute: vi.fn() };
    const openController = new OpenCatalogCreateDialogController(openCreateDialog as never);
    openController.run();
    expect(openCreateDialog.execute).toHaveBeenCalledTimes(1);
  });
});
