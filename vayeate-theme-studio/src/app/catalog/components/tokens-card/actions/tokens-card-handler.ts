import { singleton } from "tsyringe";
import { OpenBulkAddDialogController } from "../../bulk-add-dialog/controllers/open-bulk-add-dialog-controller";
import { AddCatalogSemanticTokenSelectorController } from "../controllers/add-catalog-semantic-token-selector-controller";
import { AddNewTokenController } from "../controllers/add-new-token-controller";
import { RemoveSemanticTokenListItemController } from "../controllers/remove-semantic-token-list-item-controller";
import { RemoveTokenController } from "../controllers/remove-token-controller";
import { SetCatalogNewSemanticTokenSelectorTextController } from "../controllers/set-catalog-new-semantic-token-selector-text-controller";
import { SetCatalogNewTokenKeyController } from "../controllers/set-catalog-new-token-key-controller";
import { SetCatalogTokensSearchTextController } from "../controllers/set-catalog-tokens-search-text-controller";
import { UpdateSemanticTokenRegistryTextController } from "../controllers/update-semantic-token-registry-text-controller";
import { UpdateTokenKeyController } from "../controllers/update-token-key-controller";
import { Logger, LoggerFactory } from "../../../../../domain/utils/logger";
import { TokensCardActions, TokensCardActionType } from "./tokens-card-action-type";

@singleton()
export class TokensCardHandler {
  private readonly log: Logger;

  constructor(
    private readonly setCatalogTokensSearchText: SetCatalogTokensSearchTextController,
    private readonly openBulkAddDialog: OpenBulkAddDialogController,
    private readonly updateTokenKey: UpdateTokenKeyController,
    private readonly removeToken: RemoveTokenController,
    private readonly setCatalogNewTokenKey: SetCatalogNewTokenKeyController,
    private readonly addNewToken: AddNewTokenController,
    private readonly setCatalogNewSemanticTokenSelectorText: SetCatalogNewSemanticTokenSelectorTextController,
    private readonly addCatalogSemanticTokenSelector: AddCatalogSemanticTokenSelectorController,
    private readonly updateSemanticTokenRegistryText: UpdateSemanticTokenRegistryTextController,
    private readonly removeSemanticTokenListItem: RemoveSemanticTokenListItemController,
    loggerFactory: LoggerFactory,
  ) {
    this.log = loggerFactory.create(TokensCardHandler.name);
  }

  handle(action: TokensCardActions): void {
    switch (action.type) {
      case TokensCardActionType.SearchTextOnChange:
        return this.setCatalogTokensSearchText.run(action.value);
      case TokensCardActionType.BulkAddButtonOnClick:
        return this.openBulkAddDialog.run();
      case TokensCardActionType.ExistingTokenKeyTextOnCommit:
        return this.updateTokenKey.run(action.key, action.value, action.tokenType);
      case TokensCardActionType.TokenRemoveButtonOnClick:
        return this.removeToken.run(action.key, action.tokenType);
      case TokensCardActionType.NewTokenKeyTextOnChange:
        return this.setCatalogNewTokenKey.run(action.value);
      case TokensCardActionType.NewTokenAddButtonOnClick:
        return this.addNewToken.run(action.tokenType, action.key);
      case TokensCardActionType.NewSemanticTokenSelectorTextOnChange:
        return this.setCatalogNewSemanticTokenSelectorText.run(action.value);
      case TokensCardActionType.NewSemanticTokenSelectorAddButtonOnClick:
        return this.addCatalogSemanticTokenSelector.run();
      case TokensCardActionType.ExistingSemanticTokenTextOnCommit:
        return this.updateSemanticTokenRegistryText.run(
          action.registryList,
          action.index,
          action.value,
        );
      case TokensCardActionType.ExistingSemanticTokenRemoveButtonOnClick:
        return this.removeSemanticTokenListItem.run(action.registryList, action.index);
    }

    const _exhaustive: never = action;
    this.log.error('Unhandled action (TokensCardAction union not exhaustive)', { action: _exhaustive });
  }
}
