import type { ChangeEvent, MouseEvent } from 'react';
import { useBulkAddDialogViewModel } from './use-bulk-add-dialog-viewmodel';

export function BulkAddDialog() {
  const {
    text,
    errorMessage,
    numNewTokens,
    duplicateCount,
    canSubmit,
    onTextChange,
    onOkClick,
    onCancelClick,
  } = useBulkAddDialogViewModel();

  function onDialogContentClick(e: MouseEvent<HTMLDivElement>) {
    // Prevent the click from propagating to the overlay.
    e.stopPropagation();
  }

  function onInputTextChange(e: ChangeEvent<HTMLTextAreaElement>) {
    onTextChange(e.target.value);
  }

  return (
    <div className="dialog-overlay" onClick={onCancelClick}>
      <div className="dialog-content dialog-wide" onClick={onDialogContentClick}>
        <h3>Bulk Add Tokens</h3>
        <p className="dialog-description">
          Paste a VS Code color theme JSON file. Tokens will be extracted from
          {' '}<code>colors</code>, <code>tokenColors</code>, and <code>semanticTokenColors</code>.
        </p>

        <textarea
          className="field-textarea"
          rows={12}
          value={text}
          placeholder='{"colors": { ... }, "tokenColors": [ ... ], "semanticTokenColors": { ... }}'
          onChange={onInputTextChange}
        />

        {errorMessage && (
          <p className="field-error">{errorMessage}</p>
        )}

        {numNewTokens > 0 && (
          <div className="bulk-add-summary">
            <span>Parsed: {numNewTokens} new token{numNewTokens !== 1 ? 's' : ''} to add
              {duplicateCount > 0 && (
                <> ({duplicateCount} already exist)</>
              )}
            </span>
          </div>
        )}

        <div className="dialog-actions">
          <button type="button" className="btn-secondary" onClick={onCancelClick}>
            Cancel
          </button>
          <button
            type="button"
            className="btn-primary"
            disabled={!canSubmit}
            onClick={onOkClick}
          >
            Add {numNewTokens} token{numNewTokens !== 1 ? 's' : ''}
          </button>
        </div>
      </div>
    </div>
  );
}
