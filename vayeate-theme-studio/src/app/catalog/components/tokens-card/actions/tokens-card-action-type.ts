import type { SemanticTokenRegistryListKind, TokenKey, TokenType } from "../../../../../model/schema/primitives";
import type { AppAction } from "../../../../core/actions/app-action";

export enum TokensCardActionType {
  SearchTextOnChange = 'CATALOG_TOKENS_SEARCH_TEXT_ON_CHANGE',
  BulkAddButtonOnClick = 'CATALOG_TOKENS_BULK_ADD_BUTTON_ON_CLICK',
  ExistingTokenKeyTextOnCommit = 'CATALOG_TOKENS_EXISTING_TOKEN_KEY_TEXT_ON_COMMIT',
  TokenRemoveButtonOnClick = 'CATALOG_TOKENS_TOKEN_REMOVE_BUTTON_ON_CLICK',
  NewTokenKeyTextOnChange = 'CATALOG_TOKENS_NEW_TOKEN_KEY_TEXT_ON_CHANGE',
  NewTokenAddButtonOnClick = 'CATALOG_TOKENS_NEW_TOKEN_ADD_BUTTON_ON_CLICK',
  NewSemanticTokenSelectorTextOnChange = 'CATALOG_TOKENS_NEW_SEMANTIC_TOKEN_SELECTOR_TEXT_ON_CHANGE',
  NewSemanticTokenSelectorAddButtonOnClick = 'CATALOG_TOKENS_NEW_SEMANTIC_TOKEN_SELECTOR_ADD_BUTTON_ON_CLICK',
  ExistingSemanticTokenTextOnCommit = 'CATALOG_TOKENS_EXISTING_SEMANTIC_TOKEN_TEXT_ON_COMMIT',
  ExistingSemanticTokenRemoveButtonOnClick = 'CATALOG_TOKENS_EXISTING_SEMANTIC_TOKEN_REMOVE_BUTTON_ON_CLICK',
}

export type TokensCardActions =
  | { type: TokensCardActionType.SearchTextOnChange; value: string }
  | { type: TokensCardActionType.BulkAddButtonOnClick }
  | { type: TokensCardActionType.ExistingTokenKeyTextOnCommit; value: string; key: TokenKey; tokenType: TokenType }
  | { type: TokensCardActionType.TokenRemoveButtonOnClick; key: TokenKey; tokenType: TokenType }
  | { type: TokensCardActionType.NewTokenKeyTextOnChange; value: string }
  | { type: TokensCardActionType.NewTokenAddButtonOnClick; tokenType: TokenType; key?: string }
  | { type: TokensCardActionType.NewSemanticTokenSelectorTextOnChange; value: string }
  | { type: TokensCardActionType.NewSemanticTokenSelectorAddButtonOnClick }
  | {
      type: TokensCardActionType.ExistingSemanticTokenTextOnCommit;
      registryList: SemanticTokenRegistryListKind;
      index: number;
      value: string;
    }
  | {
      type: TokensCardActionType.ExistingSemanticTokenRemoveButtonOnClick;
      registryList: SemanticTokenRegistryListKind;
      index: number;
    };


const tokensCardTypes = new Set<string>(Object.values(TokensCardActionType));

export function isTokensCardAction(a: AppAction): a is TokensCardActions {
  return tokensCardTypes.has(a.type);
}
