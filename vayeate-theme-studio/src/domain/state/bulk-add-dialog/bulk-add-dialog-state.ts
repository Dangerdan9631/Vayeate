import type { TokenType } from '../../../model/schema/primitives';

export interface BulkAddDialogState {
  isOpen: boolean;
  text: string;
  errorMessage: string | null;
  counts: Record<TokenType, number> | null;
  newCount: number;
  duplicateCount: number;
}

export const emptyBulkAddData: BulkAddDialogState = {
  isOpen: false,
  text: '',
  errorMessage: null,
  counts: null,
  newCount: 0,
  duplicateCount: 0,
};
