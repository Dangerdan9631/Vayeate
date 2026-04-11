import type { ChangeEvent } from 'react';
import { useCreateThemeDialogViewModel } from '../viewmodel/use-create-theme-dialog-viewmodel';

export function CreateThemeDialog() {
  const {
    name,
    canSubmit,
    showNameError,
    handleSubmit,
    handleCancel,
    handleDialogContentClick,
    handleNameChange,
  } = useCreateThemeDialogViewModel();

  function onNameInputChange(e: ChangeEvent<HTMLInputElement>) {
    handleNameChange(e.target.value);
  }

  return (
    <div className="dialog-overlay" onClick={handleCancel}>
      <div className="dialog-content" onClick={handleDialogContentClick}>
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
            onClick={handleCancel}
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
