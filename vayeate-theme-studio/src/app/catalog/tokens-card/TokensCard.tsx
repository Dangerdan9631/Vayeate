import { useCallback, useState, type ChangeEvent, type FocusEvent, type KeyboardEvent, type MouseEvent } from 'react';
import { CATALOG_TOKEN_LIST_SECTIONS, useTokensCardViewModel } from './use-tokens-card-viewmodel';
import type { Catalog, Token } from '../../../model/schema/catalog';
import type { SemanticTokenRegistryListKind, TokenType } from '../../../model/schema/primitives';

function TokenTypeSection({
  tokenType,
  tokens,
  isManual,
  newKey,
  canAddNewTokenKey,
  onAdd,
  onRemove,
  onUpdateKey,
  onNewKeyChange,
}: {
  tokenType: TokenType;
  tokens: Token[];
  isManual: boolean;
  newKey: string;
  canAddNewTokenKey: boolean;
  onAdd: (tokenType: TokenType) => void;
  onRemove: (tokenType: TokenType, key: string | undefined) => void;
  onUpdateKey: (tokenType: TokenType, oldKey: string | undefined, newKey: string) => void;
  onNewKeyChange?: (value: string) => void;
}) {
  const [collapsed, setCollapsed] = useState(false);

  function onTreeHeaderClick() {
    setCollapsed((value) => !value);
  }

  function onAddButtonClick() {
    onAdd(tokenType);
  }

  const onTokenRowBlur = useCallback(
    (e: FocusEvent<HTMLInputElement>) => {
      onUpdateKey(tokenType, e.currentTarget.dataset.tokenKey, e.target.value);
    },
    [onUpdateKey, tokenType],
  );

  const onRemoveButtonClick = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      onRemove(tokenType, e.currentTarget.dataset.tokenKey);
    },
    [onRemove, tokenType],
  );

  function onNewKeyInputChange(e: ChangeEvent<HTMLInputElement>) {
    onNewKeyChange?.(e.target.value);
  }

  const label =
    tokenType === 'theme'
      ? 'Theme Tokens'
      : 'Textmate Tokens';

  return (
    <div className="tree-section">
      <button
        type="button"
        className="tree-header"
        onClick={onTreeHeaderClick}
      >
        <span className="material-symbols-outlined tree-chevron">
          {collapsed ? 'chevron_right' : 'expand_more'}
        </span>
        <span className="tree-label">{label}</span>
        <span className="tree-count">({tokens.length})</span>
      </button>

      {!collapsed && (
        <div className="tree-children">
          {tokens.map((t) => (
            <div key={t.key} className="token-row">
              {isManual ? (
                <>
                  <input
                    className="token-input"
                    type="text"
                    data-token-key={t.key}
                    defaultValue={t.key}
                    onBlur={onTokenRowBlur}
                  />
                  <button
                    type="button"
                    className="btn-icon btn-danger-icon"
                    title="Remove"
                    data-token-key={t.key}
                    onClick={onRemoveButtonClick}
                  >
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </>
              ) : (
                <span className="token-text">{t.key}</span>
              )}
            </div>
          ))}

          {isManual && (
            <div className="token-row token-add-row">
              <input
                className="token-input"
                type="text"
                placeholder="new key…"
                value={newKey}
                onChange={onNewKeyInputChange}
              />
              <button
                type="button"
                className="btn-icon btn-add-icon"
                title="Add"
                disabled={!canAddNewTokenKey}
                onClick={onAddButtonClick}
              >
                <span className="material-symbols-outlined">add</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SemanticTokenCatalogSection({
  catalog,
  canEdit,
  canAddSemanticTokenSelector,
  shouldShowSemanticTokenSection,
  itemCount,
  semanticSelectorText,
  onSemanticSelectorTextChange,
  onSemanticSelectorAdd,
  onSemanticRegistryTextCommit,
  onSemanticRegistryRemove,
}: {
  catalog: Catalog;
  canEdit: boolean;
  canAddSemanticTokenSelector: boolean;
  shouldShowSemanticTokenSection: boolean;
  itemCount: number;
  semanticSelectorText: string;
  onSemanticSelectorTextChange?: (value: string) => void;
  onSemanticSelectorAdd?: () => void;
  onSemanticRegistryTextCommit?: (
    registryList: SemanticTokenRegistryListKind,
    index: number,
    value: string,
  ) => void;
  onSemanticRegistryRemove?: (registryList: SemanticTokenRegistryListKind, index: number) => void;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const types = catalog.semanticTokenTypes ?? [];
  const modifiers = catalog.semanticTokenModifiers ?? [];
  const languages = catalog.semanticTokenLanguages ?? [];

  function onTreeHeaderClick() {
    setCollapsed((value) => !value);
  }

  function onSemanticSelectorInputChange(e: ChangeEvent<HTMLInputElement>) {
    onSemanticSelectorTextChange?.(e.target.value);
  }

  function onSemanticSelectorInputKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    onSemanticSelectorAdd?.();
  }

  function onSemanticSelectorAddButtonClick() {
    onSemanticSelectorAdd?.();
  }

  if (!shouldShowSemanticTokenSection) return null;

  return (
    <div className="tree-section">
      <button
        type="button"
        className="tree-header"
        onClick={onTreeHeaderClick}
      >
        <span className="material-symbols-outlined tree-chevron">
          {collapsed ? 'chevron_right' : 'expand_more'}
        </span>
        <span className="tree-label">Semantic Tokens</span>
        <span className="tree-count">
          ({itemCount})
        </span>
      </button>
      {!collapsed && (
        <div className="tree-children">
          {canEdit && onSemanticSelectorTextChange && onSemanticSelectorAdd && (
            <div className="token-row token-add-row">
              <input
                className="token-input"
                type="text"
                placeholder="type.modifier.modifier:language or *"
                value={semanticSelectorText}
                onChange={onSemanticSelectorInputChange}
                onKeyDown={onSemanticSelectorInputKeyDown}
                aria-label="Semantic selector"
              />
              <button
                type="button"
                className="btn-icon btn-add-icon"
                title="Add"
                disabled={!canAddSemanticTokenSelector}
                onClick={onSemanticSelectorAddButtonClick}
              >
                <span className="material-symbols-outlined">add</span>
              </button>
            </div>
          )}
          {types.map((t, i) => {
            function onTypeRowBlur(e: FocusEvent<HTMLInputElement>) {
              onSemanticRegistryTextCommit?.('types', i, e.target.value);
            }
            function onTypeRemoveClick() {
              onSemanticRegistryRemove?.('types', i);
            }
            return (
            <div key={`type-${i}-${t}`} className="token-row">
              <span className="token-label">tokenType:</span>
              {canEdit && onSemanticRegistryTextCommit ? (
                <>
                  <input
                    className="token-input"
                    type="text"
                    defaultValue={t}
                    onBlur={onTypeRowBlur}
                    aria-label={`tokenType ${i + 1}`}
                  />
                  <button
                    type="button"
                    className="btn-icon btn-danger-icon"
                    title="Remove"
                    onClick={onTypeRemoveClick}
                  >
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </>
              ) : (
                <span className="token-text">{t}</span>
              )}
            </div>
            );
          })}
          {modifiers.map((m: string, i: number) => {
            function onModifierRowBlur(e: FocusEvent<HTMLInputElement>) {
              onSemanticRegistryTextCommit?.('modifiers', i, e.target.value);
            }
            function onModifierRemoveClick() {
              onSemanticRegistryRemove?.('modifiers', i);
            }
            return (
            <div key={`modifier-${i}-${m}`} className="token-row">
              <span className="token-label">modifier:</span>
              {canEdit && onSemanticRegistryTextCommit ? (
                <>
                  <input
                    className="token-input"
                    type="text"
                    defaultValue={m}
                    onBlur={onModifierRowBlur}
                    aria-label={`modifier ${i + 1}`}
                  />
                  <button
                    type="button"
                    className="btn-icon btn-danger-icon"
                    title="Remove"
                    onClick={onModifierRemoveClick}
                  >
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </>
              ) : (
                <span className="token-text">{m}</span>
              )}
            </div>
            );
          })}
          {languages.map((lang: string, i: number) => {
            function onLanguageRowBlur(e: FocusEvent<HTMLInputElement>) {
              onSemanticRegistryTextCommit?.('languages', i, e.target.value);
            }
            function onLanguageRemoveClick() {
              onSemanticRegistryRemove?.('languages', i);
            }
            return (
            <div key={`language-${i}-${lang}`} className="token-row">
              <span className="token-label">language:</span>
              {canEdit && onSemanticRegistryTextCommit ? (
                <>
                  <input
                    className="token-input"
                    type="text"
                    defaultValue={lang}
                    onBlur={onLanguageRowBlur}
                    aria-label={`language ${i + 1}`}
                  />
                  <button
                    type="button"
                    className="btn-icon btn-danger-icon"
                    title="Remove"
                    onClick={onLanguageRemoveClick}
                  >
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </>
              ) : (
                <span className="token-text">{lang}</span>
              )}
            </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function TokensCard() {
  const {
    catalog,
    tokensSearchText,
    newTokenKey,
    newSemanticTokenSelectorText,
    filteredTokensByType,
    canEdit,
    canAddNewTokenKey,
    canAddSemanticTokenSelector,
    shouldShowSemanticTokenSection,
    semanticRegistryItemCount,
    onBulkAddClick,
    onSearchChange,
    onNewTokenAddClick,
    onTokenRemoveClick,
    onTokenKeyCommit,
    onNewTokenKeyChange,
    onNewSemanticTokenSelectorTextChange,
    onNewSemanticTokenSelectorAddClick,
    onSemanticRegistryTextCommit,
    onSemanticRegistryRemoveClick,
  } = useTokensCardViewModel();

  function onSearchInputChange(e: ChangeEvent<HTMLInputElement>) {
    onSearchChange(e.target.value);
  }

  if (!catalog) return null;

  return (
    <div className="tokens-card placeholder">
      <div className="tokens-card-header">
        <h2>Tokens</h2>
        {canEdit && (
          <button
            type="button"
            className="btn-secondary btn-sm"
            onClick={onBulkAddClick}
          >
            Bulk Add
          </button>
        )}
      </div>
      <input
        type="text"
        className="card-search-input"
        placeholder="Search…"
        value={tokensSearchText}
        onChange={onSearchInputChange}
        aria-label="Search tokens"
      />
      {CATALOG_TOKEN_LIST_SECTIONS.map((tt) => (
        <TokenTypeSection
          key={tt}
          tokenType={tt}
          tokens={filteredTokensByType[tt]}
          isManual={canEdit}
          newKey={newTokenKey}
          canAddNewTokenKey={canAddNewTokenKey}
          onAdd={onNewTokenAddClick}
          onRemove={onTokenRemoveClick}
          onUpdateKey={onTokenKeyCommit}
          onNewKeyChange={onNewTokenKeyChange}
        />
      ))}
      <SemanticTokenCatalogSection
        catalog={catalog}
        canEdit={canEdit}
        canAddSemanticTokenSelector={canAddSemanticTokenSelector}
        shouldShowSemanticTokenSection={shouldShowSemanticTokenSection}
        itemCount={semanticRegistryItemCount}
        semanticSelectorText={newSemanticTokenSelectorText}
        onSemanticSelectorTextChange={onNewSemanticTokenSelectorTextChange}
        onSemanticSelectorAdd={onNewSemanticTokenSelectorAddClick}
        onSemanticRegistryTextCommit={onSemanticRegistryTextCommit}
        onSemanticRegistryRemove={onSemanticRegistryRemoveClick}
      />
    </div>
  );
}
