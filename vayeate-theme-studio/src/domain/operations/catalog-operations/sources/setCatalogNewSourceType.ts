import type { SourceType } from '../../../../model/schemas';
import type { SetState } from '../types';

export function setCatalogNewSourceType(setState: SetState, value: SourceType): void {
  setState({ type: 'SET_CATALOG_NEW_SOURCE_TYPE', value });
}



