import { useCallback, useEffect, useMemo, type MouseEvent } from 'react';
import { useAppDispatch } from '../../../common/context/use-app-dispatch';
import type { BulkParseResult } from '../../../../domain/utils/theme-parser';
import type { Catalog, Token } from '../../../../model/schema/catalog';
import { CatalogActionType } from '../../actions/catalog-action-type';
import { CatalogsStore, getCurrentCatalog } from '../../../../domain/catalog/state/catalogs-store';
import { container } from 'tsyringe';
import { useStore } from 'zustand';

const catalogsStore = container.resolve(CatalogsStore);

export interface BulkAddDialogViewModel {
  text: string;
  isError: boolean;
  errorMessage: string | null;
  parsed: { result: BulkParseResult; newCount: number } | null;
  canSubmit: boolean;
  duplicateCount: number;
  handleTextChange: (value: string) => void;
  handleSubmit: () => void;
  handleCancel: () => void;
  handleDialogContentClick: (e: MouseEvent<HTMLDivElement>) => void;
}

export function useBulkAddDialogViewModel(): BulkAddDialogViewModel {
  const dispatch = useAppDispatch();
  const catalog: Catalog | null = useStore(catalogsStore.api, getCurrentCatalog);
  const bulkAddDialog = useStore(catalogsStore.api, (state) => state.stateV2.bulkAddDialog);
  const text = bulkAddDialog?.text ?? '';

  const catalogTokenSignature = useMemo(
    () => (catalog ? catalog.tokens.map((t: Token) => `${t.type}::${t.key}`).join('\0') : ''),
    [catalog],
  );

  useEffect(() => {
    if (!text.trim()) return;
    void dispatch({ type: CatalogActionType.CatalogBulkAddTokensTextOnChange, value: text });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- omit `text`: keystrokes dispatch via handleTextChange; this re-syncs when catalog tokens change
  }, [catalogTokenSignature, dispatch]);

  const errorMessage =
    bulkAddDialog !== null && bulkAddDialog.errorMessage !== null ? bulkAddDialog.errorMessage : null;
  const isError = errorMessage !== null;
  const parsed =
    bulkAddDialog !== null &&
    bulkAddDialog.errorMessage === null &&
    bulkAddDialog.counts !== null
      ? {
          result: {
            counts: bulkAddDialog.counts,
            tokens: [] as Token[],
          },
          newCount: bulkAddDialog.newCount,
        }
      : null;
  const canSubmit = parsed !== null && parsed.newCount > 0;
  const duplicateCount = bulkAddDialog?.duplicateCount ?? 0;

  const handleTextChange = useCallback(
    (value: string) => {
      void dispatch({ type: CatalogActionType.CatalogBulkAddTokensTextOnChange, value });
    },
    [dispatch],
  );

  const handleSubmit = useCallback(() => {
    void dispatch({ type: CatalogActionType.CatalogBulkAddTokensOkButtonOnClick });
  }, [dispatch]);

  const handleCancel = useCallback(() => {
    void dispatch({ type: CatalogActionType.CatalogBulkAddTokensCancelButtonOnClick });
  }, [dispatch]);

  const handleDialogContentClick = useCallback((e: MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
  }, []);

  return {
    text,
    isError,
    errorMessage,
    parsed,
    canSubmit,
    duplicateCount,
    handleTextChange,
    handleSubmit,
    handleCancel,
    handleDialogContentClick,
  };
}
