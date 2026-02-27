import { useState } from 'react';
import type { Catalog, Token, TokenType } from '../../model/schemas';
import { tokenKeySchema } from '../../model/schemas';

interface TokensCardProps {
  catalog: Catalog;
  tokensByType: Record<TokenType, Token[]>;
  isLatestVersion: boolean;
  onAddToken: (key: string, tokenType: TokenType) => void;
  onRemoveToken: (key: string, tokenType: TokenType) => void;
  onUpdateTokenKey: (oldKey: string, newKey: string, tokenType: TokenType) => void;
  onBulkAdd: () => void;
}

const TOKEN_TYPES: TokenType[] = ['theme', 'token', 'semantic token'];

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
}: {
  tokenType: TokenType;
  tokens: Token[];
  isManual: boolean;
  onAdd: (key: string) => void;
  onRemove: (key: string) => void;
  onUpdateKey: (oldKey: string, newKey: string) => void;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [newKey, setNewKey] = useState('');

  const label =
    tokenType === 'theme'
      ? 'Theme Tokens'
      : tokenType === 'token'
        ? 'Tokens'
        : 'Semantic Tokens';

  return (
    <div className="tree-section">
      <button
        type="button"
        className="tree-header"
        onClick={() => setCollapsed(!collapsed)}
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
                    onBlur={(e) => {
                      const v = e.target.value.trim();
                      if (v && v !== t.key && isValidTokenKey(v)) onUpdateKey(t.key, v);
                    }}
                  />
                  <button
                    type="button"
                    className="btn-icon btn-danger-icon"
                    title="Remove"
                    onClick={() => onRemove(t.key)}
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
                onChange={(e) => setNewKey(e.target.value)}
              />
              <button
                type="button"
                className="btn-icon btn-add-icon"
                title="Add"
                disabled={!isValidTokenKey(newKey.trim())}
                onClick={() => {
                  const key = newKey.trim();
                  if (isValidTokenKey(key)) {
                    onAdd(key);
                    setNewKey('');
                  }
                }}
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

export function TokensCard({
  catalog,
  tokensByType,
  isLatestVersion,
  onAddToken,
  onRemoveToken,
  onUpdateTokenKey,
  onBulkAdd,
}: TokensCardProps) {
  const canEdit = catalog.type === 'manual' && isLatestVersion;

  return (
    <div className="tokens-card placeholder">
      <div className="tokens-card-header">
        <h2>Tokens</h2>
        {canEdit && (
          <button type="button" className="btn-secondary btn-sm" onClick={onBulkAdd}>
            Bulk Add
          </button>
        )}
      </div>
      {TOKEN_TYPES.map((tt) => (
        <TokenTypeSection
          key={tt}
          tokenType={tt}
          tokens={tokensByType[tt]}
          isManual={canEdit}
          onAdd={(key) => onAddToken(key, tt)}
          onRemove={(key) => onRemoveToken(key, tt)}
          onUpdateKey={(oldKey, newKey) => onUpdateTokenKey(oldKey, newKey, tt)}
        />
      ))}
    </div>
  );
}
