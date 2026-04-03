import { useState } from 'react';
import { useAppDispatch, useCatalogsState } from '../../context/app-context-hooks';
import type { Catalog, Token, TokenKey, TokenType } from '../../../../model/schemas';
import { tokenKeySchema } from '../../../../model/schemas';
import { mergeSemanticSelectorInto } from '../../../../domain/utils/semantic-token';
import { CatalogActionType } from '../../../actions/action-types';

interface TokensCardProps {
  catalog: Catalog;
  tokensByType: Record<TokenType, Token[]>;
  isLatestVersion: boolean;
  onAddToken?: (key: string, tokenType: TokenType) => void;
  onRemoveToken?: (key: string, tokenType: TokenType) => void;
  onUpdateTokenKey?: (oldKey: string, newKey: string, tokenType: TokenType) => void;
  onBulkAdd?: () => void;
  onAddSemanticFromSelector?: (selector: string) => void;
  onSetSemanticTypes?: (types: string[]) => void;
  onSetSemanticModifiers?: (modifiers: string[]) => void;
  onSetSemanticLanguages?: (languages: string[]) => void;
}

/** Sections shown in the catalog pane: Theme Tokens, Tokens, Semantic Tokens */
const TOKEN_LIST_SECTIONS: TokenType[] = ['theme', 'textmate token'];

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
  onAdd: (key: string) => void;
  onRemove: (key: string) => void;
  onUpdateKey: (oldKey: string, newKey: string) => void;
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
      onAdd(key);
      setNewKey('');
    }
  };
  const handleTokenBlur = (oldKey: string, value: string) => {
    const v = value.trim();
    if (v && v !== oldKey && isValidTokenKey(v)) onUpdateKey(oldKey, v);
  };
  const handleRemoveClick = (key: string) => () => onRemove(key);

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
                    defaultValue={t.key}
                    onBlur={(e) => handleTokenBlur(t.key, e.target.value)}
                  />
                  <button
                    type="button"
                    className="btn-icon btn-danger-icon"
                    title="Remove"
                    onClick={handleRemoveClick(t.key)}
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
                onChange={(e) => handleNewKeyChange(e.target.value)}
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

function matchesSearch(key: string, searchQuery: string): boolean {
  const q = searchQuery.trim().toLowerCase();
  return !q || key.toLowerCase().includes(q);
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
  onAddSemanticFromSelector,
  onSetSemanticTypes,
  onSetSemanticModifiers,
  onSetSemanticLanguages,
}: {
  catalog: Catalog;
  canEdit: boolean;
  onAddSemanticFromSelector?: (selector: string) => void;
  onSetSemanticTypes?: (types: string[]) => void;
  onSetSemanticModifiers?: (modifiers: string[]) => void;
  onSetSemanticLanguages?: (languages: string[]) => void;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [selectorInput, setSelectorInput] = useState('');
  const toggleCollapsed = () => setCollapsed((v) => !v);
  const handleSelectorInputChange = (value: string) => setSelectorInput(value);
  const handleSelectorInputKeyDown = (key: string, preventDefault: () => void) => {
    if (key === 'Enter') {
      preventDefault();
      handleAddSelector();
    }
  };
  const types = catalog.semanticTokenTypes ?? [];
  const modifiers = catalog.semanticTokenModifiers ?? [];
  const languages = catalog.semanticTokenLanguages ?? [];
  const hasAny = types.length > 0 || modifiers.length > 0 || languages.length > 0;
  const showSection = canEdit || hasAny;
  const addEnabled =
    canEdit &&
    onAddSemanticFromSelector &&
    canAddSemanticSelector(selectorInput, catalog);

  if (!showSection) return null;

  const handleAddSelector = () => {
    const trimmed = selectorInput.trim();
    if (!trimmed || !onAddSemanticFromSelector) return;
    if (mergeSemanticSelectorInto(trimmed, {
      types,
      modifiers,
      languages,
    }) !== null) {
      onAddSemanticFromSelector(trimmed);
      setSelectorInput('');
    }
  };

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
          {canEdit && onAddSemanticFromSelector && (
            <div className="token-row token-add-row">
              <input
                className="token-input"
                type="text"
                placeholder="type.modifier.modifier:language or *"
                value={selectorInput}
                onChange={(e) => handleSelectorInputChange(e.target.value)}
                onKeyDown={(e) => handleSelectorInputKeyDown(e.key, () => e.preventDefault())}
                aria-label="Semantic selector"
              />
              <button
                type="button"
                className="btn-icon btn-add-icon"
                title="Add"
                disabled={!addEnabled}
                onClick={handleAddSelector}
              >
                <span className="material-symbols-outlined">add</span>
              </button>
            </div>
          )}
          {types.map((t, i) => (
            <div key={`type-${i}-${t}`} className="token-row">
              <span className="token-label">tokenType:</span>
              {canEdit && onSetSemanticTypes ? (
                <>
                  <input
                    className="token-input"
                    type="text"
                    defaultValue={t}
                    onBlur={(e) => {
                      const v = e.target.value.trim();
                      if (v !== t) {
                        const next = types.map((x, j) => (j === i ? v : x));
                        onSetSemanticTypes(next);
                      }
                    }}
                    aria-label={`tokenType ${i + 1}`}
                  />
                  <button
                    type="button"
                    className="btn-icon btn-danger-icon"
                    title="Remove"
                    onClick={() =>
                      onSetSemanticTypes(types.filter((_, j) => j !== i))
                    }
                  >
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </>
              ) : (
                <span className="token-text">{t}</span>
              )}
            </div>
          ))}
          {modifiers.map((m, i) => (
            <div key={`modifier-${i}-${m}`} className="token-row">
              <span className="token-label">modifier:</span>
              {canEdit && onSetSemanticModifiers ? (
                <>
                  <input
                    className="token-input"
                    type="text"
                    defaultValue={m}
                    onBlur={(e) => {
                      const v = e.target.value.trim();
                      if (v !== m) {
                        const next = modifiers.map((x, j) => (j === i ? v : x));
                        onSetSemanticModifiers(next);
                      }
                    }}
                    aria-label={`modifier ${i + 1}`}
                  />
                  <button
                    type="button"
                    className="btn-icon btn-danger-icon"
                    title="Remove"
                    onClick={() =>
                      onSetSemanticModifiers(modifiers.filter((_, j) => j !== i))
                    }
                  >
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </>
              ) : (
                <span className="token-text">{m}</span>
              )}
            </div>
          ))}
          {languages.map((lang, i) => (
            <div key={`language-${i}-${lang}`} className="token-row">
              <span className="token-label">language:</span>
              {canEdit && onSetSemanticLanguages ? (
                <>
                  <input
                    className="token-input"
                    type="text"
                    defaultValue={lang}
                    onBlur={(e) => {
                      const v = e.target.value.trim();
                      if (v !== lang) {
                        const next = languages.map((x, j) => (j === i ? v : x));
                        onSetSemanticLanguages(next);
                      }
                    }}
                    aria-label={`language ${i + 1}`}
                  />
                  <button
                    type="button"
                    className="btn-icon btn-danger-icon"
                    title="Remove"
                    onClick={() =>
                      onSetSemanticLanguages(languages.filter((_, j) => j !== i))
                    }
                  >
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </>
              ) : (
                <span className="token-text">{lang}</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function TokensCard({
  catalog,
  tokensByType,
  isLatestVersion,
  onAddSemanticFromSelector,
  onSetSemanticTypes,
  onSetSemanticModifiers,
  onSetSemanticLanguages,
}: TokensCardProps) {
  const dispatch = useAppDispatch();
  const tokensSearchText = useCatalogsState().tokensSearchText;
  const canEdit = catalog.type === 'manual' && isLatestVersion;
  const handleBulkAddClick = () =>
    dispatch({ type: CatalogActionType.CatalogTokensBulkAddButtonOnClick });
  const handleSearchChange = (value: string) =>
    dispatch({ type: CatalogActionType.CatalogTokensSearchTextOnChange, value });
  const handleAddToken = (tokenType: TokenType) => (key: string) => {
    dispatch({
      type: CatalogActionType.CatalogTokensNewTokenAddButtonOnClick,
      tokenType,
      key,
    });
  };
  const handleRemoveToken = (tokenType: TokenType) => (key: string) => {
    dispatch({
      type: CatalogActionType.CatalogTokensTokenRemoveButtonOnClick,
      key: key as TokenKey,
      tokenType,
    });
  };
  const handleUpdateTokenKey = (tokenType: TokenType) => (oldKey: string, newKey: string) => {
    dispatch({
      type: CatalogActionType.CatalogTokensExistingTokenKeyTextOnCommit,
      value: newKey,
      key: oldKey as TokenKey,
      tokenType,
    });
  };
  const handleNewTokenKeyChange = (value: string) => {
    dispatch({ type: CatalogActionType.CatalogTokensNewTokenKeyTextOnChange, value });
  };

  const filteredTokensByType = Object.fromEntries(
    TOKEN_LIST_SECTIONS.map((tt) => [
      tt,
      tokensByType[tt]
        .filter((t) => matchesSearch(t.key, tokensSearchText))
        .sort((a, b) => a.key.localeCompare(b.key)),
    ])
  ) as Record<TokenType, Token[]>;

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
        onChange={(e) => handleSearchChange(e.target.value)}
        aria-label="Search tokens"
      />
      {TOKEN_LIST_SECTIONS.map((tt) => (
        <TokenTypeSection
          key={tt}
          tokenType={tt}
          tokens={filteredTokensByType[tt]}
          isManual={canEdit}
          onAdd={handleAddToken(tt)}
          onRemove={handleRemoveToken(tt)}
          onUpdateKey={handleUpdateTokenKey(tt)}
          onNewKeyChange={handleNewTokenKeyChange}
        />
      ))}
      <SemanticTokenCatalogSection
        catalog={catalog}
        canEdit={canEdit}
        onAddSemanticFromSelector={onAddSemanticFromSelector}
        onSetSemanticTypes={onSetSemanticTypes}
        onSetSemanticModifiers={onSetSemanticModifiers}
        onSetSemanticLanguages={onSetSemanticLanguages}
      />
    </div>
  );
}
