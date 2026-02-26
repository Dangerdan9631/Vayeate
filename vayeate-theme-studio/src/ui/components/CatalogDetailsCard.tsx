import { useState } from 'react';
import type { Catalog, Source, TokenType } from '../../model/schemas';

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
  const [sourcesText, setSourcesText] = useState(
    catalog.sources.map((s) => s.url).join('\n'),
  );

  function handleSourcesBlur() {
    const urls = sourcesText
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);
    const sources: Source[] = urls.map((url) => ({ url, type: 'default' as const }));
    onUpdateSources(sources);
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
        <label className="field-row">
          <span className="field-label">Sources (one URL per line)</span>
          <textarea
            className="sources-textarea"
            value={sourcesText}
            onChange={(e) => setSourcesText(e.target.value)}
            onBlur={handleSourcesBlur}
            rows={4}
            disabled={!isLatestVersion}
          />
        </label>
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
