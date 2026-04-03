import { useState } from 'react';
import { useAppDispatch, useCatalogsState } from '../context/app-context-hooks';
import type { Catalog, SourceType, TokenType } from '../../../model/schemas';
import { CatalogActionType } from '../../actions/action-types';

const TOKEN_TYPE_OPTIONS: TokenType[] = ['theme', 'textmate token', 'semantic token'];
const SOURCE_TYPE_OPTIONS_FOR_THEME: SourceType[] = ['default', 'color-registry', 'color-registry-set'];
const SOURCE_TYPE_OPTIONS_FOR_SEMANTIC: SourceType[] = ['default', 'semantic-token-registry'];
const SOURCE_TYPE_OPTIONS_FOR_TEXTMATE: SourceType[] = ['default', 'textmate-xml', 'textmate-json'];

function getTokenTypeLabel(t: TokenType): string {
  return t === 'theme' ? 'Theme Tokens' : t === 'textmate token' ? 'Textmate Tokens' : 'Semantic Tokens';
}

function getSourceTypeOptions(tokenType: TokenType): SourceType[] {
  if (tokenType === 'theme') return SOURCE_TYPE_OPTIONS_FOR_THEME;
  if (tokenType === 'semantic token') return SOURCE_TYPE_OPTIONS_FOR_SEMANTIC;
  if (tokenType === 'textmate token') return SOURCE_TYPE_OPTIONS_FOR_TEXTMATE;
  return ['default'];
}

function getTokenTypeOptions(sourceType: SourceType): TokenType[] {
  if (sourceType === 'color-registry' || sourceType === 'color-registry-set') return ['theme'];
  if (sourceType === 'semantic-token-registry') return ['semantic token'];
  if (sourceType === 'textmate-xml' || sourceType === 'textmate-json') return ['textmate token'];
  return TOKEN_TYPE_OPTIONS;
}

interface CatalogDetailsCardProps {
  catalog: Catalog;
  tokenCounts: Record<TokenType, number>;
  isLatestVersion: boolean;
  onDeleteVersion: () => void;
  onLock: () => void;
  onSync: () => void;
  onRevert: () => void;
}

export function CatalogDetailsCard({
  catalog,
  tokenCounts,
  isLatestVersion,
  onDeleteVersion,
  onLock,
  onSync,
  onRevert,
}: CatalogDetailsCardProps) {
  const dispatch = useAppDispatch();
  const catalogsState = useCatalogsState();
  const newSourceUrl = catalogsState.newSourceUrl;
  const newSourceTokenType = catalogsState.newSourceTokenType;
  const newSourceType = catalogsState.newSourceType;
  const [editingSourceIndex, setEditingSourceIndex] = useState<number | null>(null);
  const [editingSourceUrl, setEditingSourceUrl] = useState('');

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

        <span className="detail-label">Textmate tokens</span>
        <span className="detail-value">{tokenCounts['textmate token']}</span>

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
                    if (v !== source.url) {
                      dispatch({
                        type: CatalogActionType.CatalogDetailsSourceUrlTextOnCommit,
                        value: v,
                        sourceIndex: i,
                      });
                    }
                    setEditingSourceIndex(null);
                  }}
                />
                <select
                  className="field-select source-select"
                  value={source.tokenType}
                  disabled={!isLatestVersion}
                  onChange={(e) => {
                    const value = e.target.value as TokenType;
                    dispatch({
                      type: CatalogActionType.CatalogDetailsSourceTokenTypeListOnCommit,
                      value,
                      sourceIndex: i,
                    });
                  }}
                >
                  {getTokenTypeOptions(source.type).map((t) => (
                    <option key={t} value={t}>{getTokenTypeLabel(t)}</option>
                  ))}
                </select>
                <select
                  className="field-select source-select"
                  value={source.type}
                  disabled={!isLatestVersion}
                  onChange={(e) => {
                    const value = e.target.value as SourceType;
                    dispatch({
                      type: CatalogActionType.CatalogDetailsSourceTypeListOnCommit,
                      value,
                      sourceIndex: i,
                    });
                  }}
                >
                  {getSourceTypeOptions(source.tokenType).map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                <button
                  type="button"
                  className="btn-icon btn-danger-icon"
                  disabled={!isLatestVersion}
                  onClick={() => {
                    dispatch({ type: CatalogActionType.CatalogDetailsSourceRemoveButtonOnClick, sourceIndex: i });
                  }}
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
                  value={newSourceUrl}
                  placeholder="https://..."
                  onChange={(e) => {
                    dispatch({ type: CatalogActionType.CatalogDetailsNewSourceUrlTextOnChange, value: e.target.value });
                  }}
                />
                <select
                  className="field-select source-select"
                  value={newSourceTokenType}
                  onChange={(e) => {
                    const tokenType = e.target.value as TokenType;
                    dispatch({ type: CatalogActionType.CatalogDetailsNewSourceTokenTypeListOnCommit, value: tokenType });
                    if (
                      tokenType !== 'theme' &&
                      (newSourceType === 'color-registry' || newSourceType === 'color-registry-set')
                    ) {
                      dispatch({ type: CatalogActionType.CatalogDetailsNewSourceTypeListOnCommit, value: 'default' });
                    }
                    if (
                      tokenType !== 'semantic token' &&
                      newSourceType === 'semantic-token-registry'
                    ) {
                      dispatch({ type: CatalogActionType.CatalogDetailsNewSourceTypeListOnCommit, value: 'default' });
                    }
                    if (
                      tokenType !== 'textmate token' &&
                      (newSourceType === 'textmate-xml' || newSourceType === 'textmate-json')
                    ) {
                      dispatch({ type: CatalogActionType.CatalogDetailsNewSourceTypeListOnCommit, value: 'default' });
                    }
                  }}
                >
                  {TOKEN_TYPE_OPTIONS.map((t) => (
                    <option key={t} value={t}>{getTokenTypeLabel(t)}</option>
                  ))}
                </select>
                <select
                  className="field-select source-select"
                  value={newSourceType}
                  onChange={(e) => {
                    dispatch({
                      type: CatalogActionType.CatalogDetailsNewSourceTypeListOnCommit,
                      value: e.target.value as SourceType,
                    });
                  }}
                >
                  {getSourceTypeOptions(newSourceTokenType).map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                <button
                  type="button"
                  className="btn-icon btn-add-icon"
                  onClick={() => {
                    dispatch({ type: CatalogActionType.CatalogDetailsNewSourceAddButtonOnClick });
                  }}
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
          <button
            type="button"
            className="btn-secondary"
            onClick={onLock}
          >
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
