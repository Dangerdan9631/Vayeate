import { delay, inject, singleton } from 'tsyringe';
import { CatalogActions } from './catalog-action-type';
import { CatalogCreateDialogHandler } from '../create-dialog/actions/catalog-create-dialog-handler';
import { isCatalogCreateDialogAction } from '../create-dialog/actions/catalog-create-dialog-action-type';
import { CatalogsCardHandler } from '../catalogs-card/actions/catalogs-card-handler';
import { isCatalogsCardAction } from '../catalogs-card/actions/catalogs-card-action-type';
import { CatalogBulkAddDialogHandler } from '../bulk-add-dialog/actions/catalog-bulk-add-dialog-handler';
import { isCatalogBulkAddDialogAction } from '../bulk-add-dialog/actions/catalog-bulk-add-dialog-action-type';
import { CatalogDetailsCardHandler } from '../catalog-details-card/actions/catalog-details-card-handler';
import { isCatalogDetailsCardAction } from '../catalog-details-card/actions/catalog-details-card-action-type';
import { TokensCardHandler } from '../tokens-card/actions/tokens-card-handler';
import { isTokensCardAction } from '../tokens-card/actions/tokens-card-action-type';
import { CatalogPageHandler } from '../catalog-page/actions/catalog-page-handler';
import { isCatalogPageAction } from '../catalog-page/actions/catalog-page-action-type';
import { Logger, LoggerFactory } from '../../../domain/utils/logger';

@singleton()
export class CatalogActionHandler {
  private readonly log: Logger;

  constructor(
    loggerFactory: LoggerFactory,
    @inject(delay(() => CatalogPageHandler)) private readonly catalogPageHandler: CatalogPageHandler,
    @inject(delay(() => CatalogCreateDialogHandler)) private readonly catalogCreateDialogHandler: CatalogCreateDialogHandler,
    @inject(delay(() => CatalogsCardHandler)) private readonly catalogsCardHandler: CatalogsCardHandler,
    @inject(delay(() => CatalogBulkAddDialogHandler)) private readonly catalogBulkAddDialogHandler: CatalogBulkAddDialogHandler,
    @inject(delay(() => CatalogDetailsCardHandler)) private readonly catalogDetailsCardHandler: CatalogDetailsCardHandler,
    @inject(delay(() => TokensCardHandler)) private readonly tokensCardHandler: TokensCardHandler,
  ) {
    this.log = loggerFactory.create('CatalogActionHandler');
  }

  async handle(action: CatalogActions): Promise<void> {
    if (isCatalogPageAction(action)) {
      return this.catalogPageHandler.handle(action);
    }

    if (isCatalogCreateDialogAction(action)) {
      return this.catalogCreateDialogHandler.handle(action);
    }

    if (isCatalogsCardAction(action)) {
      return this.catalogsCardHandler.handle(action);
    }

    if (isCatalogBulkAddDialogAction(action)) {
      return this.catalogBulkAddDialogHandler.handle(action);
    }

    if (isCatalogDetailsCardAction(action)) {
      return this.catalogDetailsCardHandler.handle(action);
    }

    if (isTokensCardAction(action)) {
      return this.tokensCardHandler.handle(action);
    }

    const _exhaustive: never = action;
    this.log.error('Unhandled action (CatalogAction union not exhaustive)', { action: _exhaustive });
  }
}
