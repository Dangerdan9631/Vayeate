import type { ChangeEvent, MouseEvent } from 'react';
import { useCreateThemeDialogViewModel } from './use-create-theme-dialog-viewmodel';

export function CreateThemeDialog() {
  const {
    name,
    canSubmit,
    showNameError,
    onOkClick,
    onCancelClick,
    onNameChange,
  } = useCreateThemeDialogViewModel();

  function onDialogContentClick(e: MouseEvent<HTMLDivElement>) {
    e.stopPropagation();
  }

  function onNameInputChange(e: ChangeEvent<HTMLInputElement>) {
    onNameChange(e.target.value);
  }

  return (
    <div className="dialog-overlay" onClick={onCancelClick}>
      <div className="dialog-content" onClick={onDialogContentClick}>
        <h3>Create New Theme</h3>

        <label className="field-row">
          <span className="field-label">Name</span>
          <input
            className="field-input"
            type="text"
            value={name}
            placeholder="my-theme"
            onChange={onNameInputChange}
          />
        </label>
        {showNameError && (
          <p className="field-error">Alphanumeric characters and hyphens only.</p>
        )}

        <div className="dialog-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={onCancelClick}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn-primary"
            disabled={!canSubmit}
            onClick={onOkClick}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
