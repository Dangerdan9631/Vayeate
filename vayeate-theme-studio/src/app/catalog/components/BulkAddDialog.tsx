import type { ChangeEvent } from 'react';
import { useBulkAddDialogViewModel } from '../viewmodel/use-bulk-add-dialog-viewmodel';

export function BulkAddDialog() {
  const {
    text,
    isError,
    errorMessage,
    parsed,
    canSubmit,
    duplicateCount,
    handleTextChange,
    handleSubmit,
    handleCancel,
    handleDialogContentClick,
  } = useBulkAddDialogViewModel();

  function onTextareaChange(e: ChangeEvent<HTMLTextAreaElement>) {
    handleTextChange(e.target.value);
  }

  return (
    <div className="dialog-overlay" onClick={handleCancel}>
      <div className="dialog-content dialog-wide" onClick={handleDialogContentClick}>
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
          onChange={onTextareaChange}
        />

        {isError && errorMessage && (
          <p className="field-error">{errorMessage}</p>
        )}

        {parsed && (
          <div className="bulk-add-summary">
            <span>Parsed: {parsed.result.counts.theme} theme, {parsed.result.counts['textmate token']} textmate, {parsed.result.counts['semantic token']} semantic</span>
            <span className="bulk-add-new">
              {parsed.newCount} new token{parsed.newCount !== 1 ? 's' : ''} to add
              {duplicateCount > 0 && (
                <> ({duplicateCount} already exist)</>
              )}
            </span>
          </div>
        )}

        <div className="dialog-actions">
          <button type="button" className="btn-secondary" onClick={handleCancel}>
            Cancel
          </button>
          <button
            type="button"
            className="btn-primary"
            disabled={!canSubmit}
            onClick={handleSubmit}
          >
            Add {parsed ? parsed.newCount : 0} token{parsed?.newCount !== 1 ? 's' : ''}
          </button>
        </div>
      </div>
    </div>
  );
}
