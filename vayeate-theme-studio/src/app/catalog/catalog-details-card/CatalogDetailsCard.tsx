import type { ChangeEvent, FocusEvent, MouseEvent } from 'react';
import { useCatalogDetailsCardViewModel } from './use-catalog-details-card-viewmodel';

/**
 * Metadata, remote sources, and version actions for the selected catalog.
 */
export function CatalogDetailsCard() {
  const {
    catalog,
    themeTokenCount,
    textmateTokenCount,
    semanticTokenCount,
    canAddNewSource,
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
  } = useCatalogDetailsCardViewModel();

  if (catalog === null) return null;

  function onNewSourceUrlInputChange(e: ChangeEvent<HTMLInputElement>) {
    onNewSourceUrlChange(e.target.value);
  }

  function onNewSourceTypeSelectChange(e: ChangeEvent<HTMLSelectElement>) {
    onNewSourceTypeChange(e.target.value);
  }

  function onNewSourceTokenTypeSelectChange(e: ChangeEvent<HTMLSelectElement>) {
    onNewSourceTokenTypeChange(e.target.value);
  }

  function onExistingSourceUrlInputFocus(e: FocusEvent<HTMLInputElement>) {
    onSourceUrlFocus(e.currentTarget.dataset.sourceIndex);
  }

  function onExistingSourceUrlInputChange(e: ChangeEvent<HTMLInputElement>) {
    onEditingSourceUrlChange(e.target.value);
  }

  function onExistingSourceUrlInputBlur(e: FocusEvent<HTMLInputElement>) {
    onSourceUrlCommit(e.target.value, e.currentTarget.dataset.sourceIndex);
  }

  function onExistingSourceTokenTypeSelectChange(e: ChangeEvent<HTMLSelectElement>) {
    onSourceTokenTypeChange(e.target.value, e.currentTarget.dataset.sourceIndex);
  }

  function onExistingSourceTypeSelectChange(e: ChangeEvent<HTMLSelectElement>) {
    onSourceTypeChange(e.target.value, e.currentTarget.dataset.sourceIndex);
  }

  function onExistingSourceRemoveButtonClick(e: MouseEvent<HTMLButtonElement>) {
    onSourceRemoveClick(e.currentTarget.dataset.sourceIndex);
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
        <span className="detail-value">{themeTokenCount}</span>

        <span className="detail-label">Textmate tokens</span>
        <span className="detail-value">{textmateTokenCount}</span>

        <span className="detail-label">Semantic tokens</span>
        <span className="detail-value">{semanticTokenCount}</span>
      </div>

      {catalog.type === 'remote' && (
        <div className="sources-section">
          <span className="field-label">Sources</span>
          <div className="sources-table">
            {sourceRows.map((source) => (
              <div className="source-row" key={source.sourceIndex}>
                <input
                  className="field-input source-url-input"
                  type="text"
                  data-source-index={source.sourceIndex}
                  value={source.url}
                  placeholder="https://..."
                  disabled={source.isDisabled}
                  onFocus={onExistingSourceUrlInputFocus}
                  onChange={onExistingSourceUrlInputChange}
                  onBlur={onExistingSourceUrlInputBlur}
                />
                <select
                  className="field-select source-select"
                  data-source-index={source.sourceIndex}
                  value={source.tokenType}
                  disabled={source.isDisabled}
                  onChange={onExistingSourceTokenTypeSelectChange}
                >
                  {source.tokenTypeOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
                <select
                  className="field-select source-select"
                  data-source-index={source.sourceIndex}
                  value={source.sourceType}
                  disabled={source.isDisabled}
                  onChange={onExistingSourceTypeSelectChange}
                >
                  {source.sourceTypeOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
                <button
                  type="button"
                  className="btn-icon btn-danger-icon"
                  data-source-index={source.sourceIndex}
                  disabled={source.isDisabled}
                  onClick={onExistingSourceRemoveButtonClick}
                  aria-label="Remove source"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            ))}
            {canAddNewSource && (
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
                  onChange={onNewSourceTokenTypeSelectChange}
                >
                  {newSourceTokenTypeOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
                <select
                  className="field-select source-select"
                  value={newSourceType}
                  onChange={onNewSourceTypeSelectChange}
                >
                  {newSourceTypeOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
                <button
                  type="button"
                  className="btn-icon btn-add-icon"
                  onClick={onNewSourceAddClick}
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
        <button type="button" className="btn-danger" onClick={onDeleteVersionClick}>
          Delete version
        </button>
        {canSync && (
          <button type="button" className="btn-secondary" onClick={onSyncClick}>
            Sync
          </button>
        )}
        {canLock && (
          <button
            type="button"
            className="btn-secondary"
            onClick={onLockClick}
          >
            Lock
          </button>
        )}
        {canRevert && (
          <button type="button" className="btn-secondary" onClick={onRevertClick}>
            Revert
          </button>
        )}
      </div>
    </div>
  );
}
