import { useState, useMemo, useEffect } from 'react';
import { useAppDispatchV2 } from '../context/slice-contexts';
import { parseThemeJson, type BulkParseResult } from '../../services/theme-parser';
import type { Token } from '../../model/schemas';

interface BulkAddDialogProps {
  existingTokenKeys: Set<string>;
  onCancel: () => void;
  onAdd: (tokens: Token[]) => void;
}

export function BulkAddDialog({ existingTokenKeys, onCancel, onAdd }: BulkAddDialogProps) {
  const dispatchV2 = useAppDispatchV2();
  const [text, setText] = useState('');

  useEffect(() => {
    dispatchV2({ type: 'CATALOG_BULK_ADD_TOKENS_DIALOG_ON_OPEN' });
  }, [dispatchV2]);

  const parseResult = useMemo((): { result: BulkParseResult; newCount: number } | { error: string } | null => {
    const trimmed = text.trim();
    if (!trimmed) return null;
    try {
      const result = parseThemeJson(trimmed);
      const newCount = result.tokens.filter((t) => !existingTokenKeys.has(`${t.type}::${t.key}`)).length;
      return { result, newCount };
    } catch (e) {
      return { error: e instanceof Error ? e.message : String(e) };
    }
  }, [text, existingTokenKeys]);

  const isError = parseResult !== null && 'error' in parseResult;
  const parsed = parseResult !== null && 'result' in parseResult ? parseResult : null;
  const canSubmit = parsed !== null && parsed.newCount > 0;

  function handleSubmit() {
    if (!parsed) return;
    onAdd(parsed.result.tokens);
  }

  return (
    <div className="dialog-overlay" onClick={onCancel}>
      <div className="dialog-content dialog-wide" onClick={(e) => e.stopPropagation()}>
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
          onChange={(e) => {
            const value = e.target.value;
            setText(value);
            dispatchV2({ type: 'CATALOG_BULK_ADD_TOKENS_TEXT_ON_CHANGE', value });
          }}
        />

        {isError && (
          <p className="field-error">{parseResult.error}</p>
        )}

        {parsed && (
          <div className="bulk-add-summary">
            <span>Parsed: {parsed.result.counts.theme} theme, {parsed.result.counts['textmate token']} textmate, {parsed.result.counts['semantic token']} semantic</span>
            <span className="bulk-add-new">
              {parsed.newCount} new token{parsed.newCount !== 1 ? 's' : ''} to add
              {parsed.result.tokens.length - parsed.newCount > 0 && (
                <> ({parsed.result.tokens.length - parsed.newCount} already exist)</>
              )}
            </span>
          </div>
        )}

        <div className="dialog-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => {
              dispatchV2({ type: 'CATALOG_BULK_ADD_TOKENS_CANCEL_BUTTON_ON_CLICK' });
              onCancel();
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn-primary"
            disabled={!canSubmit}
            onClick={() => {
              dispatchV2({ type: 'CATALOG_BULK_ADD_TOKENS_OK_BUTTON_ON_CLICK' });
              handleSubmit();
            }}
          >
            Add {parsed ? parsed.newCount : 0} token{parsed?.newCount !== 1 ? 's' : ''}
          </button>
        </div>
      </div>
    </div>
  );
}
