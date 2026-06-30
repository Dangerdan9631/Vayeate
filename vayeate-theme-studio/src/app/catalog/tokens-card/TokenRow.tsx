import { memo, type FocusEvent, type MouseEvent } from 'react';
import type { TokenType } from '../../../model/schema/primitives';
import type { Token } from '../../../model/schema/catalog';

/**
 * Props for a single editable or read-only token key row.
 */
export interface TokenRowProps {
  token: Token;
  isManual: boolean;
  onUpdateKey: (tokenType: TokenType, oldKey: string | undefined, newKey: string) => void;
  onRemove: (tokenType: TokenType, key: string | undefined) => void;
  tokenType: TokenType;
}

/**
 * Renders one token key row with optional edit and remove controls.
 */
function TokenRowComponent({
  token,
  isManual,
  onUpdateKey,
  onRemove,
  tokenType,
}: TokenRowProps) {
  function onTokenRowBlur(e: FocusEvent<HTMLInputElement>) {
    onUpdateKey(tokenType, e.currentTarget.dataset.tokenKey, e.target.value);
  }

  function onRemoveButtonClick(e: MouseEvent<HTMLButtonElement>) {
    onRemove(tokenType, e.currentTarget.dataset.tokenKey);
  }

  return (
    <div className="token-row">
      {isManual ? (
        <>
          <input
            className="token-input"
            type="text"
            data-token-key={token.key}
            defaultValue={token.key}
            onBlur={onTokenRowBlur}
          />
          <button
            type="button"
            className="btn-icon btn-danger-icon"
            title="Remove"
            data-token-key={token.key}
            onClick={onRemoveButtonClick}
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </>
      ) : (
        <span className="token-text">{token.key}</span>
      )}
    </div>
  );
}

/**
 * Memoized row component for one theme or textmate token key.
 */
export const TokenRow = memo(TokenRowComponent);
