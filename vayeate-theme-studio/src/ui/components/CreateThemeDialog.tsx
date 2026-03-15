import { useState } from 'react';
import { useAppDispatch } from '../context/slice-contexts';

const NAME_REGEX = /^[a-zA-Z0-9-]+$/;

interface CreateThemeDialogProps {
  onCancel: () => void;
  onCreate: (params: { name: string }) => void;
}

export function CreateThemeDialog({ onCancel, onCreate }: CreateThemeDialogProps) {
  const dispatch = useAppDispatch();
  const [name, setName] = useState('');

  const nameValid = name.length > 0 && NAME_REGEX.test(name);
  const canSubmit = nameValid;

  function handleSubmit() {
    if (!canSubmit) return;
    onCreate({ name });
  }

  return (
    <div className="dialog-overlay" onClick={onCancel}>
      <div className="dialog-content" onClick={(e) => e.stopPropagation()}>
        <h3>Create New Theme</h3>

        <label className="field-row">
          <span className="field-label">Name</span>
          <input
            className="field-input"
            type="text"
            value={name}
            placeholder="my-theme"
            onChange={(e) => {
              const value = e.target.value;
              setName(value);
              dispatch({ type: 'THEME_CREATE_DIALOG_NAME_TEXT_ON_CHANGE', value });
            }}
          />
        </label>
        {name.length > 0 && !nameValid && (
          <p className="field-error">Alphanumeric characters and hyphens only.</p>
        )}

        <div className="dialog-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => {
              dispatch({ type: 'THEME_CREATE_DIALOG_CANCEL_BUTTON_ON_CLICK' });
              onCancel();
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn-primary"
            disabled={!canSubmit}
            onClick={handleSubmit}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
