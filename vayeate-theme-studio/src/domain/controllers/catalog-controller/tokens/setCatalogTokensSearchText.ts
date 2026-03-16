import { setCatalogTokensSearchText as setCatalogTokensSearchTextOp, type SetState } from '../../../operations/catalog-operations';

export function setCatalogTokensSearchText(setState: SetState, value: string): void {
  setCatalogTokensSearchTextOp(setState, value);
}

