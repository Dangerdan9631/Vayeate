import type { AppAction } from "../../../../core/actions/app-action";
import { TokensCardActions, TokensCardActionType } from "./tokens-card-action-type";

const tokensCardTypes = new Set<string>(Object.values(TokensCardActionType));

export function isTokensCardAction(a: AppAction): a is TokensCardActions {
  return tokensCardTypes.has(a.type);
}
