import { useCallback, useMemo, type MouseEvent } from 'react';
import { useContextSelector } from 'use-context-selector';
import { useAppDispatch } from '../../common/context/use-app-dispatch';
import { AppContext } from '../../core/app-context';
import { parseThemeJson, type BulkParseResult } from '../../../domain/utils/theme-parser';
import type { Token } from '../../../model/schemas';
import { CatalogActionType } from '../actions/catalog-action-type';

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
  const catalog = useContextSelector(AppContext, (c) => {
    const slice = c?.state.catalogs;
    if (slice === undefined) {
      throw new Error('Catalog state requires AppProvider.');
    }
    return slice.catalog;
  });
  const text = useContextSelector(AppContext, (c) => {
    const slice = c?.state.catalogs;
    if (slice === undefined) {
      throw new Error('Catalog state requires AppProvider.');
    }
    return slice.bulkAddText;
  });
  const existingTokenKeys = useMemo(() => {
    if (!catalog) return new Set<string>();
    return new Set(catalog.tokens.map((t: Token) => `${t.type}::${t.key}`));
  }, [catalog]);

  const parseOutcome = useMemo((): { result: BulkParseResult; newCount: number } | { error: string } | null => {
    const trimmed = text.trim();
    if (!trimmed) return null;
    try {
      const result = parseThemeJson(trimmed);
      const newCount = result.tokens.filter((t) => !existingTokenKeys.has(`${t.type}::${t.key}`)).length;
      return { result, newCount };
    } catch (e) {
      return { error: e instanceof Error ? e.message : String(e) };
    }
  }, [text, existingTokenKeys]);

  const isError = parseOutcome !== null && 'error' in parseOutcome;
  const errorMessage = isError ? parseOutcome.error : null;
  const parsed = parseOutcome !== null && 'result' in parseOutcome ? parseOutcome : null;
  const canSubmit = parsed !== null && parsed.newCount > 0;
  const duplicateCount = parsed ? parsed.result.tokens.length - parsed.newCount : 0;

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
