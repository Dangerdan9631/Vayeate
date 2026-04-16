import { useCallback, useState, type ChangeEvent, type FocusEvent, type KeyboardEvent, type MouseEvent } from 'react';
import { CATALOG_TOKEN_LIST_SECTIONS, useTokensCardViewModel } from '../viewmodel/use-tokens-card-viewmodel';
import type { Catalog, SemanticTokenRegistryListKind, Token, TokenType } from '../../../model/schemas';
import { tokenKeySchema } from '../../../model/schemas';
import { mergeSemanticSelectorInto } from '../../../domain/utils/semantic-token';

function isValidTokenKey(value: string): boolean {
  return tokenKeySchema.safeParse(value).success;
}

function TokenTypeSection({
  tokenType,
  tokens,
  isManual,
  onAdd,
  onRemove,
  onUpdateKey,
  onNewKeyChange,
}: {
  tokenType: TokenType;
  tokens: Token[];
  isManual: boolean;
  onAdd: (tokenType: TokenType, key: string) => void;
  onRemove: (tokenType: TokenType, key: string) => void;
  onUpdateKey: (tokenType: TokenType, oldKey: string, newKey: string) => void;
  onNewKeyChange?: (value: string) => void;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [newKey, setNewKey] = useState('');
  const toggleCollapsed = () => setCollapsed((v) => !v);
  const handleNewKeyChange = (value: string) => {
    setNewKey(value);
    onNewKeyChange?.(value);
  };
  const handleAddClick = () => {
    const key = newKey.trim();
    if (isValidTokenKey(key)) {
      onAdd(tokenType, key);
      setNewKey('');
    }
  };

  const onTokenRowBlur = useCallback(
    (e: FocusEvent<HTMLInputElement>) => {
      const oldKey = e.currentTarget.dataset.tokenKey;
      const v = e.target.value.trim();
      if (oldKey && v && v !== oldKey && isValidTokenKey(v)) onUpdateKey(tokenType, oldKey, v);
    },
    [onUpdateKey, tokenType],
  );

  const onRemoveButtonClick = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      const key = e.currentTarget.dataset.tokenKey;
      if (key) onRemove(tokenType, key);
    },
    [onRemove, tokenType],
  );

  function onNewKeyInputChange(e: ChangeEvent<HTMLInputElement>) {
    handleNewKeyChange(e.target.value);
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
        onClick={toggleCollapsed}
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
                disabled={!isValidTokenKey(newKey.trim())}
                onClick={handleAddClick}
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

function canAddSemanticSelector(selector: string, catalog: Catalog): boolean {
  const trimmed = selector.trim();
  if (!trimmed) return false;
  const current = {
    types: catalog.semanticTokenTypes ?? [],
    modifiers: catalog.semanticTokenModifiers ?? [],
    languages: catalog.semanticTokenLanguages ?? [],
  };
  return mergeSemanticSelectorInto(trimmed, current) !== null;
}

function SemanticTokenCatalogSection({
  catalog,
  canEdit,
  semanticSelectorText,
  onSemanticSelectorTextChange,
  onSemanticSelectorAdd,
  onSemanticRegistryTextCommit,
  onSemanticRegistryRemove,
}: {
  catalog: Catalog;
  canEdit: boolean;
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
  const toggleCollapsed = () => setCollapsed((v) => !v);
  const types = catalog.semanticTokenTypes ?? [];
  const modifiers = catalog.semanticTokenModifiers ?? [];
  const languages = catalog.semanticTokenLanguages ?? [];
  const hasAny = types.length > 0 || modifiers.length > 0 || languages.length > 0;
  const showSection = canEdit || hasAny;
  const addEnabled =
    canEdit &&
    onSemanticSelectorAdd &&
    canAddSemanticSelector(semanticSelectorText, catalog);
  const handleSelectorInputKeyDown = (key: string, preventDefault: () => void) => {
    if (key === 'Enter') {
      preventDefault();
      if (addEnabled) onSemanticSelectorAdd?.();
    }
  };

  function onSemanticSelectorInputChange(e: ChangeEvent<HTMLInputElement>) {
    onSemanticSelectorTextChange?.(e.target.value);
  }

  function onSemanticSelectorInputKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    handleSelectorInputKeyDown(e.key, () => e.preventDefault());
  }

  function onSemanticSelectorAddButtonClick() {
    onSemanticSelectorAdd?.();
  }

  if (!showSection) return null;

  return (
    <div className="tree-section">
      <button
        type="button"
        className="tree-header"
        onClick={toggleCollapsed}
      >
        <span className="material-symbols-outlined tree-chevron">
          {collapsed ? 'chevron_right' : 'expand_more'}
        </span>
        <span className="tree-label">Semantic Tokens</span>
        <span className="tree-count">
          ({types.length + modifiers.length + languages.length})
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
                disabled={!addEnabled}
                onClick={onSemanticSelectorAddButtonClick}
              >
                <span className="material-symbols-outlined">add</span>
              </button>
            </div>
          )}
          {types.map((t, i) => {
            function onTypeRowBlur(e: FocusEvent<HTMLInputElement>) {
              const v = e.target.value.trim();
              if (v !== t) onSemanticRegistryTextCommit?.('types', i, v);
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
          {modifiers.map((m, i) => {
            function onModifierRowBlur(e: FocusEvent<HTMLInputElement>) {
              const v = e.target.value.trim();
              if (v !== m) onSemanticRegistryTextCommit?.('modifiers', i, v);
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
          {languages.map((lang, i) => {
            function onLanguageRowBlur(e: FocusEvent<HTMLInputElement>) {
              const v = e.target.value.trim();
              if (v !== lang) onSemanticRegistryTextCommit?.('languages', i, v);
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
    newSemanticTokenSelectorText,
    filteredTokensByType,
    canEdit,
    handleBulkAddClick,
    handleSearchChange,
    handleAddToken,
    handleRemoveToken,
    handleUpdateTokenKey,
    handleNewTokenKeyChange,
    handleNewSemanticTokenSelectorTextChange,
    handleNewSemanticTokenSelectorAdd,
    handleSemanticRegistryTextCommit,
    handleSemanticRegistryRemove,
  } = useTokensCardViewModel();

  function onSearchChange(e: ChangeEvent<HTMLInputElement>) {
    handleSearchChange(e.target.value);
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
            onClick={handleBulkAddClick}
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
        onChange={onSearchChange}
        aria-label="Search tokens"
      />
      {CATALOG_TOKEN_LIST_SECTIONS.map((tt) => (
        <TokenTypeSection
          key={tt}
          tokenType={tt}
          tokens={filteredTokensByType[tt]}
          isManual={canEdit}
          onAdd={handleAddToken}
          onRemove={handleRemoveToken}
          onUpdateKey={handleUpdateTokenKey}
          onNewKeyChange={handleNewTokenKeyChange}
        />
      ))}
      <SemanticTokenCatalogSection
        catalog={catalog}
        canEdit={canEdit}
        semanticSelectorText={newSemanticTokenSelectorText}
        onSemanticSelectorTextChange={handleNewSemanticTokenSelectorTextChange}
        onSemanticSelectorAdd={handleNewSemanticTokenSelectorAdd}
        onSemanticRegistryTextCommit={handleSemanticRegistryTextCommit}
        onSemanticRegistryRemove={handleSemanticRegistryRemove}
      />
    </div>
  );
}
