import { useCallback, useMemo, useState } from 'react';
import { useAppDispatch } from '../../core/action-queue/use-app-dispatch';
import { compareVersions } from '../../../domain/utils/compare-versions';
import type { Catalog } from '../../../model/schema/catalog';
import { sourceTypeSchema, tokenTypeSchema, type SourceType, type TokenType } from '../../../model/schema/primitives';
import { CatalogDetailsCardActionType } from './actions/catalog-details-card-action-type';
import { container } from 'tsyringe';
import { CatalogsStore, getCurrentCatalog, getCurrentCatalogRefs } from '../../../domain/catalog/state/catalogs-store';
import { CatalogUiStore } from '../../../domain/state/ui/catalog-ui-store';
import { useStore } from 'zustand';

const catalogsStore = container.resolve(CatalogsStore);
const catalogUiStore = container.resolve(CatalogUiStore);
const TOKEN_TYPE_OPTIONS = tokenTypeSchema.options;
const SOURCE_TYPE_OPTIONS = sourceTypeSchema.options;

export interface CatalogDetailsCardOption<TValue extends string> {
  value: TValue;
  label: string;
}

export interface CatalogDetailsCardSourceRowViewModel {
  sourceIndex: number;
  url: string;
  tokenType: TokenType;
  sourceType: SourceType;
  isDisabled: boolean;
  tokenTypeOptions: CatalogDetailsCardOption<TokenType>[];
  sourceTypeOptions: CatalogDetailsCardOption<SourceType>[];
}

export interface CatalogDetailsCardViewModel {
  catalog: Catalog | null;
  themeTokenCount: number;
  textmateTokenCount: number;
  semanticTokenCount: number;
  isLatestVersion: boolean;
  canAddNewSource: boolean;
  canSync: boolean;
  canLock: boolean;
  canRevert: boolean;
  newSourceUrl: string;
  newSourceTokenType: TokenType;
  newSourceType: SourceType;
  sourceRows: CatalogDetailsCardSourceRowViewModel[];
  newSourceTokenTypeOptions: CatalogDetailsCardOption<TokenType>[];
  newSourceTypeOptions: CatalogDetailsCardOption<SourceType>[];
  onDeleteVersionClick: () => void;
  onLockClick: () => void;
  onSyncClick: () => void;
  onRevertClick: () => void;
  onEditingSourceUrlChange: (value: string) => void;
  onSourceUrlFocus: (sourceIndex: string | undefined) => void;
  onSourceUrlCommit: (value: string, sourceIndex: string | undefined) => void;
  onSourceTokenTypeChange: (value: string, sourceIndex: string | undefined) => void;
  onSourceTypeChange: (value: string, sourceIndex: string | undefined) => void;
  onSourceRemoveClick: (sourceIndex: string | undefined) => void;
  onNewSourceUrlChange: (value: string) => void;
  onNewSourceTokenTypeChange: (value: string) => void;
  onNewSourceTypeChange: (value: string) => void;
  onNewSourceAddClick: () => void;
}

function getTokenTypeLabel(value: TokenType): string {
  return value === 'theme' ? 'Theme Tokens' : value === 'textmate token' ? 'Textmate Tokens' : 'Semantic Tokens';
}

function getTokenTypeOption(value: TokenType): CatalogDetailsCardOption<TokenType> {
  return {
    value,
    label: getTokenTypeLabel(value),
  };
}

function getSourceTypeOption(value: SourceType): CatalogDetailsCardOption<SourceType> {
  return {
    value,
    label: value,
  };
}

function getSourceTypeOptions(tokenType: TokenType): CatalogDetailsCardOption<SourceType>[] {
  return SOURCE_TYPE_OPTIONS
    .filter((sourceType) => {
      if (sourceType === 'default') return true;
      if (sourceType === 'color-registry' || sourceType === 'color-registry-set') return tokenType === 'theme';
      if (sourceType === 'semantic-token-registry') return tokenType === 'semantic token';
      if (sourceType === 'textmate-xml' || sourceType === 'textmate-json') return tokenType === 'textmate token';
      return false;
    })
    .map(getSourceTypeOption);
}

function getTokenTypeOptions(sourceType: SourceType): CatalogDetailsCardOption<TokenType>[] {
  return TOKEN_TYPE_OPTIONS
    .filter((tokenType) => {
      if (sourceType === 'default') return true;
      if (sourceType === 'color-registry' || sourceType === 'color-registry-set') return tokenType === 'theme';
      if (sourceType === 'semantic-token-registry') return tokenType === 'semantic token';
      if (sourceType === 'textmate-xml' || sourceType === 'textmate-json') return tokenType === 'textmate token';
      return false;
    })
    .map(getTokenTypeOption);
}

function parseSourceIndex(value: string | undefined): number | null {
  const sourceIndex = Number(value);
  return Number.isNaN(sourceIndex) ? null : sourceIndex;
}

function parseTokenType(value: string): TokenType | null {
  return TOKEN_TYPE_OPTIONS.includes(value as TokenType) ? value as TokenType : null;
}

function parseSourceType(value: string): SourceType | null {
  return SOURCE_TYPE_OPTIONS.includes(value as SourceType) ? value as SourceType : null;
}

export function useCatalogDetailsCardViewModel(): CatalogDetailsCardViewModel {
  const dispatch = useAppDispatch();
  const selectedRef = useStore(catalogUiStore.api, (state) => state.state.selectedRef);
  const newSourceUrl = useStore(catalogUiStore.api, (state) => state.state.newSource.url);
  const newSourceTokenType = useStore(catalogUiStore.api, (state) => state.state.newSource.tokenType);
  const newSourceType = useStore(catalogUiStore.api, (state) => state.state.newSource.type);
  const catalogMap = useStore(catalogsStore.api, (state) => state.state.catalogs);
  const catalogRefs = useMemo(() => getCurrentCatalogRefs(catalogMap), [catalogMap]);

  const catalog: Catalog | null = useMemo(() => {
    return getCurrentCatalog(catalogMap, selectedRef);
  }, [catalogMap, selectedRef]);

  const selectedName = useMemo(() => selectedRef?.name ?? null, [selectedRef]);

  const isLatestVersion = useMemo(() => {
    if (!selectedRef || !selectedName) return false;
    const best = catalogRefs
      .filter((r) => r.name === selectedName)
      .reduce(
        (acc, r) => (!acc || compareVersions(r.version, acc.version) > 0 ? r : acc),
        null as (typeof catalogRefs)[number] | null,
      );
    return best !== null && best.version === selectedRef.version;
  }, [catalogRefs, selectedRef, selectedName]);

  const themeTokenCount = useMemo(() => {
    return catalog?.tokens.filter((token) => token.type === 'theme').length ?? 0;
  }, [catalog]);

  const textmateTokenCount = useMemo(() => {
    return catalog?.tokens.filter((token) => token.type === 'textmate token').length ?? 0;
  }, [catalog]);

  const semanticTokenCount = useMemo(() => {
    return catalog?.tokens.filter((token) => token.type === 'semantic token').length ?? 0;
  }, [catalog]);

  const [editingSourceIndex, setEditingSourceIndex] = useState<number | null>(null);
  const [editingSourceUrl, setEditingSourceUrl] = useState('');

  const shouldShowNewSourceRow = useMemo(() => isLatestVersion, [isLatestVersion]);
  const canSync = useMemo(() => catalog?.type === 'remote' && isLatestVersion, [catalog, isLatestVersion]);
  const canLock = useMemo(() => catalog?.type === 'manual' && !catalog.locked && isLatestVersion, [catalog, isLatestVersion]);
  const canRevert = useMemo(() => !isLatestVersion, [isLatestVersion]);
  const sourceRows = useMemo(() => {
    return catalog?.sources.map((source, sourceIndex) => ({
      sourceIndex,
      url: editingSourceIndex === sourceIndex ? editingSourceUrl : source.url,
      tokenType: source.tokenType,
      sourceType: source.type,
      isDisabled: !isLatestVersion,
      tokenTypeOptions: getTokenTypeOptions(source.type),
      sourceTypeOptions: getSourceTypeOptions(source.tokenType),
    })) ?? [];
  }, [catalog, editingSourceIndex, editingSourceUrl, isLatestVersion]);

  const newSourceTokenTypeOptions = useMemo(() => {
    return TOKEN_TYPE_OPTIONS.map(getTokenTypeOption);
  }, []);

  const newSourceTypeOptions = useMemo(() => {
    return getSourceTypeOptions(newSourceTokenType);
  }, [newSourceTokenType]);

  const onLockClick = useCallback(() => {
    void dispatch({ type: CatalogDetailsCardActionType.LockButtonOnClick });
  }, [dispatch]);

  const onSyncClick = useCallback(() => {
    void dispatch({ type: CatalogDetailsCardActionType.SyncButtonOnClick });
  }, [dispatch]);

  const onDeleteVersionClick = useCallback(() => {
    if (!selectedRef) return;
    void dispatch({ type: CatalogDetailsCardActionType.DeleteVersionButtonOnClick });
  }, [dispatch, selectedRef]);

  const onRevertClick = useCallback(() => {
    void dispatch({ type: CatalogDetailsCardActionType.RevertButtonOnClick });
  }, [dispatch]);

  const onEditingSourceUrlChange = useCallback((value: string) => {
    setEditingSourceUrl(value);
  }, []);

  const onSourceUrlFocus = useCallback(
    (sourceIndexInput: string | undefined) => {
      const sourceIndex = parseSourceIndex(sourceIndexInput);
      if (sourceIndex === null || !catalog) return;
      const url = catalog.sources[sourceIndex]?.url ?? '';
      setEditingSourceIndex(sourceIndex);
      setEditingSourceUrl(url);
    },
    [catalog],
  );

  const onSourceUrlCommit = useCallback(
    (value: string, sourceIndexInput: string | undefined) => {
      const sourceIndex = parseSourceIndex(sourceIndexInput);
      if (sourceIndex === null || !catalog) return;
      const committedUrl = catalog.sources[sourceIndex]?.url ?? '';
      const nextUrl = value.trim();
      if (nextUrl === committedUrl) {
        setEditingSourceIndex(null);
        return;
      }
      void dispatch({
        type: CatalogDetailsCardActionType.SourceUrlTextOnCommit,
        value: nextUrl,
        sourceIndex,
      });
      setEditingSourceIndex(null);
    },
    [catalog, dispatch],
  );

  const onSourceTokenTypeChange = useCallback(
    (value: string, sourceIndexInput: string | undefined) => {
      const sourceIndex = parseSourceIndex(sourceIndexInput);
      const tokenType = parseTokenType(value);
      if (sourceIndex === null || tokenType === null) return;
      void dispatch({
        type: CatalogDetailsCardActionType.SourceTokenTypeListOnCommit,
        value: tokenType,
        sourceIndex,
      });
    },
    [dispatch],
  );

  const onSourceTypeChange = useCallback(
    (value: string, sourceIndexInput: string | undefined) => {
      const sourceIndex = parseSourceIndex(sourceIndexInput);
      const sourceType = parseSourceType(value);
      if (sourceIndex === null || sourceType === null) return;
      void dispatch({
        type: CatalogDetailsCardActionType.SourceTypeListOnCommit,
        value: sourceType,
        sourceIndex,
      });
    },
    [dispatch],
  );

  const onSourceRemoveClick = useCallback(
    (sourceIndexInput: string | undefined) => {
      const sourceIndex = parseSourceIndex(sourceIndexInput);
      if (sourceIndex === null) return;
      void dispatch({ type: CatalogDetailsCardActionType.SourceRemoveButtonOnClick, sourceIndex });
    },
    [dispatch],
  );

  const onNewSourceUrlChange = useCallback(
    (value: string) => {
      void dispatch({ type: CatalogDetailsCardActionType.NewSourceUrlTextOnChange, value });
    },
    [dispatch],
  );

  const onNewSourceTokenTypeChange = useCallback(
    (value: string) => {
      const tokenType = parseTokenType(value);
      if (tokenType === null) return;
      void dispatch({ type: CatalogDetailsCardActionType.NewSourceTokenTypeListOnCommit, value: tokenType });
    },
    [dispatch],
  );

  const onNewSourceTypeChange = useCallback(
    (value: string) => {
      const sourceType = parseSourceType(value);
      if (sourceType === null) return;
      void dispatch({ type: CatalogDetailsCardActionType.NewSourceTypeListOnCommit, value: sourceType });
    },
    [dispatch],
  );

  const onNewSourceAddClick = useCallback(() => {
    void dispatch({ type: CatalogDetailsCardActionType.NewSourceAddButtonOnClick });
  }, [dispatch]);

  return {
    catalog,
    themeTokenCount,
    textmateTokenCount,
    semanticTokenCount,
    isLatestVersion,
    canAddNewSource: shouldShowNewSourceRow,
    canSync,
    canLock,
    canRevert,
    newSourceUrl,
    newSourceTokenType,
    newSourceType,
    sourceRows,
    newSourceTokenTypeOptions,
    newSourceTypeOptions,
    onDeleteVersionClick,
    onLockClick,
    onSyncClick,
    onRevertClick,
    onEditingSourceUrlChange,
    onSourceUrlFocus,
    onSourceUrlCommit,
    onSourceTokenTypeChange,
    onSourceTypeChange,
    onSourceRemoveClick,
    onNewSourceUrlChange,
    onNewSourceTokenTypeChange,
    onNewSourceTypeChange,
    onNewSourceAddClick,
  };
}
