import { useState } from 'react';
import type { Catalog, Source, SourceType, TokenType } from '../../model/schemas';

const TOKEN_TYPE_OPTIONS: TokenType[] = ['theme', 'token', 'semantic token'];
const SOURCE_TYPE_OPTIONS: SourceType[] = ['default'];

interface CatalogDetailsCardProps {
  catalog: Catalog;
  tokenCounts: Record<TokenType, number>;
  isLatestVersion: boolean;
  onDeleteVersion: () => void;
  onLock: () => void;
  onSync: () => void;
  onUpdateSources: (sources: Source[]) => void;
  onRevert: () => void;
}

export function CatalogDetailsCard({
  catalog,
  tokenCounts,
  isLatestVersion,
  onDeleteVersion,
  onLock,
  onSync,
  onUpdateSources,
  onRevert,
}: CatalogDetailsCardProps) {
  const [newUrl, setNewUrl] = useState('');
  const [newTokenType, setNewTokenType] = useState<TokenType>('theme');
  const [newSourceType, setNewSourceType] = useState<SourceType>('default');
  const [editingSourceIndex, setEditingSourceIndex] = useState<number | null>(null);
  const [editingSourceUrl, setEditingSourceUrl] = useState('');

  function handleUpdateSource(index: number, updated: Source) {
    const next = catalog.sources.map((s, i) => (i === index ? updated : s));
    onUpdateSources(next);
  }

  function handleRemoveSource(index: number) {
    onUpdateSources(catalog.sources.filter((_, i) => i !== index));
  }

  function handleAddSource() {
    const trimmed = newUrl.trim();
    if (!trimmed) return;
    const source: Source = { url: trimmed, type: newSourceType, tokenType: newTokenType };
    onUpdateSources([...catalog.sources, source]);
    setNewUrl('');
  }

  return (
    <div className="catalog-details-card placeholder">
      <h2>Catalog Details</h2>

      <div className="detail-grid">
        <span className="detail-label">Name</span>
        <span className="detail-value">{catalog.name}</span>

        <span className="detail-label">Version</span>
        <span className="detail-value">{catalog.version}</span>

        <span className="detail-label">Type</span>
        <span className="detail-value">{catalog.type}</span>

        <span className="detail-label">Locked</span>
        <span className="detail-value">{catalog.locked ? 'Yes' : 'No'}</span>

        <span className="detail-label">Theme tokens</span>
        <span className="detail-value">{tokenCounts.theme}</span>

        <span className="detail-label">Tokens</span>
        <span className="detail-value">{tokenCounts.token}</span>

        <span className="detail-label">Semantic tokens</span>
        <span className="detail-value">{tokenCounts['semantic token']}</span>
      </div>

      {catalog.type === 'remote' && (
        <div className="sources-section">
          <span className="field-label">Sources</span>
          <div className="sources-table">
            {catalog.sources.map((source, i) => (
              <div className="source-row" key={i}>
                <input
                  className="field-input source-url-input"
                  type="text"
                  value={editingSourceIndex === i ? editingSourceUrl : source.url}
                  placeholder="https://..."
                  disabled={!isLatestVersion}
                  onFocus={() => {
                    setEditingSourceIndex(i);
                    setEditingSourceUrl(source.url);
                  }}
                  onChange={(e) => setEditingSourceUrl(e.target.value)}
                  onBlur={(e) => {
                    const v = e.target.value.trim();
                    if (v !== source.url) handleUpdateSource(i, { ...source, url: v });
                    setEditingSourceIndex(null);
                  }}
                />
                <select
                  className="field-select source-select"
                  value={source.tokenType}
                  disabled={!isLatestVersion}
                  onChange={(e) =>
                    handleUpdateSource(i, {
                      ...source,
                      tokenType: e.target.value as TokenType,
                    })
                  }
                >
                  {TOKEN_TYPE_OPTIONS.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                <select
                  className="field-select source-select"
                  value={source.type}
                  disabled={!isLatestVersion}
                  onChange={(e) =>
                    handleUpdateSource(i, {
                      ...source,
                      type: e.target.value as SourceType,
                    })
                  }
                >
                  {SOURCE_TYPE_OPTIONS.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                <button
                  type="button"
                  className="btn-icon btn-danger-icon"
                  disabled={!isLatestVersion}
                  onClick={() => handleRemoveSource(i)}
                  aria-label="Remove source"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            ))}
            {isLatestVersion && (
              <div className="source-row source-add-row">
                <input
                  className="field-input source-url-input"
                  type="text"
                  value={newUrl}
                  placeholder="https://..."
                  onChange={(e) => setNewUrl(e.target.value)}
                />
                <select
                  className="field-select source-select"
                  value={newTokenType}
                  onChange={(e) => setNewTokenType(e.target.value as TokenType)}
                >
                  {TOKEN_TYPE_OPTIONS.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                <select
                  className="field-select source-select"
                  value={newSourceType}
                  onChange={(e) => setNewSourceType(e.target.value as SourceType)}
                >
                  {SOURCE_TYPE_OPTIONS.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                <button
                  type="button"
                  className="btn-icon btn-add-icon"
                  onClick={handleAddSource}
                  aria-label="Add source"
                >
                  <span className="material-symbols-outlined">add</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="details-actions">
        <button type="button" className="btn-danger" onClick={onDeleteVersion}>
          Delete version
        </button>
        {catalog.type === 'remote' && isLatestVersion && (
          <button type="button" className="btn-secondary" onClick={onSync}>
            Sync
          </button>
        )}
        {catalog.type === 'manual' && !catalog.locked && isLatestVersion && (
          <button type="button" className="btn-secondary" onClick={onLock}>
            Lock
          </button>
        )}
        {!isLatestVersion && (
          <button type="button" className="btn-secondary" onClick={onRevert}>
            Revert
          </button>
        )}
      </div>
    </div>
  );
}
