import type { ChangeEvent } from 'react';
import { useCatalogDetailsCardViewModel } from './use-catalog-details-card-viewmodel';
import { TokenType, SourceType } from '../../../../model/schema/primitives';

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

export function CatalogDetailsCard() {
  const vm = useCatalogDetailsCardViewModel();

  const {
    catalog,
    tokenCounts,
    isLatestVersion,
    onDeleteVersion,
    onLock,
    onSync,
    onRevert,
    newSourceUrl,
    newSourceTokenType,
    newSourceType,
    editingSourceIndex,
    editingSourceUrl,
    setEditingSourceUrl,
    changeNewSourceUrl,
    commitNewSourceTokenType,
    commitNewSourceType,
    addNewSource,
    onExistingSourceUrlFocus,
    onExistingSourceUrlBlur,
    onExistingSourceTokenTypeChange,
    onExistingSourceTypeChange,
    onRemoveExistingSourceClick,
  } = vm;

  if (!catalog) return null;

  function onNewSourceUrlInputChange(e: ChangeEvent<HTMLInputElement>) {
    changeNewSourceUrl(e.target.value);
  }

  function onNewSourceTypeSelectChange(e: ChangeEvent<HTMLSelectElement>) {
    commitNewSourceType(e.target.value as SourceType);
  }

  function onNewSourceTokenTypeChange(e: ChangeEvent<HTMLSelectElement>) {
    commitNewSourceTokenType(e.target.value as TokenType);
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

        <span className="detail-label">Textmate tokens</span>
        <span className="detail-value">{tokenCounts['textmate token']}</span>

        <span className="detail-label">Semantic tokens</span>
        <span className="detail-value">{tokenCounts['semantic token']}</span>
      </div>

      {catalog.type === 'remote' && (
        <div className="sources-section">
          <span className="field-label">Sources</span>
          <div className="sources-table">
            {catalog.sources.map((source, i) => {
              function onEditSourceUrlInputChange(e: ChangeEvent<HTMLInputElement>) {
                setEditingSourceUrl(e.target.value);
              }

              return (
                <div className="source-row" key={i}>
                  <input
                    className="field-input source-url-input"
                    type="text"
                    data-source-index={i}
                    value={editingSourceIndex === i ? editingSourceUrl : source.url}
                    placeholder="https://..."
                    disabled={!isLatestVersion}
                    onFocus={onExistingSourceUrlFocus}
                    onChange={onEditSourceUrlInputChange}
                    onBlur={onExistingSourceUrlBlur}
                  />
                  <select
                    className="field-select source-select"
                    data-source-index={i}
                    value={source.tokenType}
                    disabled={!isLatestVersion}
                    onChange={onExistingSourceTokenTypeChange}
                  >
                    {getTokenTypeOptions(source.type).map((t) => (
                      <option key={t} value={t}>{getTokenTypeLabel(t)}</option>
                    ))}
                  </select>
                  <select
                    className="field-select source-select"
                    data-source-index={i}
                    value={source.type}
                    disabled={!isLatestVersion}
                    onChange={onExistingSourceTypeChange}
                  >
                    {getSourceTypeOptions(source.tokenType).map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className="btn-icon btn-danger-icon"
                    data-source-index={i}
                    disabled={!isLatestVersion}
                    onClick={onRemoveExistingSourceClick}
                    aria-label="Remove source"
                  >
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>
              );
            })}
            {isLatestVersion && (
              <div className="source-row source-add-row">
                <input
                  className="field-input source-url-input"
                  type="text"
                  value={newSourceUrl}
                  placeholder="https://..."
                  onChange={onNewSourceUrlInputChange}
                />
                <select
                  className="field-select source-select"
                  value={newSourceTokenType}
                  onChange={onNewSourceTokenTypeChange}
                >
                  {TOKEN_TYPE_OPTIONS.map((t) => (
                    <option key={t} value={t}>{getTokenTypeLabel(t)}</option>
                  ))}
                </select>
                <select
                  className="field-select source-select"
                  value={newSourceType}
                  onChange={onNewSourceTypeSelectChange}
                >
                  {getSourceTypeOptions(newSourceTokenType).map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                <button
                  type="button"
                  className="btn-icon btn-add-icon"
                  onClick={addNewSource}
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
