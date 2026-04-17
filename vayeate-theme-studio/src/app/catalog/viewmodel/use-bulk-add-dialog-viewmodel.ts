import { useCallback, useEffect, useMemo, type MouseEvent } from 'react';
import { useAppDispatch } from '../../common/context/use-app-dispatch';
import type { BulkParseResult } from '../../../domain/utils/theme-parser';
import type { Catalog, Token } from '../../../model/schema/catalog';
import { CatalogActionType } from '../actions/catalog-action-type';
import { CatalogsStore } from '../../../domain/state/catalog/catalogs-store';
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
  const catalog: Catalog = useStore(catalogsStore.api, (state) => state.state.catalog);
  const text = useStore(catalogsStore.api, (state) => state.state.bulkAddText);
  const bulkAddParse = useStore(catalogsStore.api, (state) => state.state.bulkAddParse);

  const catalogTokenSignature = useMemo(
    () => (catalog ? catalog.tokens.map((t) => `${t.type}::${t.key}`).join('\0') : ''),
    [catalog],
  );

  useEffect(() => {
    if (!text.trim()) return;
    void dispatch({ type: CatalogActionType.CatalogBulkAddTokensTextOnChange, value: text });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- omit `text`: keystrokes dispatch via handleTextChange; this re-syncs when catalog tokens change
  }, [catalogTokenSignature, dispatch]);

  const errorMessage =
    bulkAddParse !== null && bulkAddParse.errorMessage !== null ? bulkAddParse.errorMessage : null;
  const isError = errorMessage !== null;
  const parsed =
    bulkAddParse !== null &&
    bulkAddParse.errorMessage === null &&
    bulkAddParse.counts !== null
      ? {
          result: {
            counts: bulkAddParse.counts,
            tokens: [] as Token[],
          },
          newCount: bulkAddParse.newCount,
        }
      : null;
  const canSubmit = parsed !== null && parsed.newCount > 0;
  const duplicateCount = bulkAddParse?.duplicateCount ?? 0;

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
