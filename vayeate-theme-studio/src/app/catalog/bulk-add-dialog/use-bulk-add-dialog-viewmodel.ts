import { useCallback, useMemo } from 'react';
import { useAppDispatch } from '../../core/action-queue/use-app-dispatch';
import { CatalogBulkAddDialogActionType } from './actions/catalog-bulk-add-dialog-action-type';
import { BulkAddDialogStore } from '../../../domain/state/ui/bulk-add-dialog-store';
import { container } from 'tsyringe';
import { useStore } from 'zustand';

const bulkAddDialogStore = container.resolve(BulkAddDialogStore);

export interface BulkAddDialogViewModel {
  text: string;
  errorMessage: string | null;
  numNewTokens: number;
  duplicateCount: number;
  canSubmit: boolean;
  onTextChange: (value: string) => void;
  onOkClick: () => void;
  onCancelClick: () => void;
}

export function useBulkAddDialogViewModel(): BulkAddDialogViewModel {
  const dispatch = useAppDispatch();
  const text = useStore(bulkAddDialogStore.api, (state) => state.state?.text ?? '');
  const errorMessage = useStore(bulkAddDialogStore.api, (state) => state.state?.errorMessage ?? null);
  const numNewTokens = useStore(bulkAddDialogStore.api, (state) => state.state?.newCount ?? 0);
  const duplicateCount = useStore(bulkAddDialogStore.api, (state) => state.state?.duplicateCount ?? 0);
  const canSubmit = useMemo(() => numNewTokens > 0, [numNewTokens]);

  const onTextChange = useCallback((value: string) => {
    void dispatch({ type: CatalogBulkAddDialogActionType.TextOnChange, value });
  }, [dispatch]);

  const onOkClick = useCallback(() => {
    void dispatch({ type: CatalogBulkAddDialogActionType.OkButtonOnClick });
  }, [dispatch]);

  const onCancelClick = useCallback(() => {
    void dispatch({ type: CatalogBulkAddDialogActionType.CancelButtonOnClick });
  }, [dispatch]);

  return {
    text,
    errorMessage,
    numNewTokens,
    duplicateCount,
    canSubmit,
    onTextChange,
    onOkClick,
    onCancelClick,
  };
}
