import type { ChangeEvent, MouseEvent } from 'react';
import { useCreateTemplateDialogViewModel } from './use-create-template-dialog-viewmodel';

/**
 * Renders the modal form for naming and creating a new template.
 * @returns Create-template dialog UI wired to its viewmodel.
 */
export function CreateTemplateDialog() {
  const {
    name,
    canSubmit,
    showNameError,
    onNameChange,
    onCancelClick,
    onOkClick,
  } = useCreateTemplateDialogViewModel();

  function onDialogContentClick(e: MouseEvent<HTMLDivElement>) {
    e.stopPropagation();
  }

  function onNameInputChange(e: ChangeEvent<HTMLInputElement>) {
    onNameChange(e.target.value);
  }

  return (
    <div className="dialog-overlay" onClick={onCancelClick}>
      <div className="dialog-content" onClick={onDialogContentClick}>
        <h3>Create New Template</h3>

        <label className="field-row">
          <span className="field-label">Name</span>
          <input
            className="field-input"
            type="text"
            value={name}
            placeholder="my-template"
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
