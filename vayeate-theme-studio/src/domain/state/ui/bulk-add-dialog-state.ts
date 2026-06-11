import type { TokenType } from '../../../model/schema/primitives';

/**
 * In-progress fields and validation metrics for the bulk-add tokens dialog.
 */
export interface BulkAddDialogState {
  isOpen: boolean;
  text: string;
  errorMessage: string | null;
  counts: Record<TokenType, number> | null;
  newCount: number;
  duplicateCount: number;
}

/**
 * Default bulk-add dialog data used when opening a new dialog session.
 */
export const emptyBulkAddData: BulkAddDialogState = {
  isOpen: false,
  text: '',
  errorMessage: null,
  counts: null,
  newCount: 0,
  duplicateCount: 0,
};
