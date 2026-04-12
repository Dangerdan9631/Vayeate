import type { ChangeEvent, MouseEvent } from 'react';
import { useCreateTemplateDialogViewModel } from '../viewmodel/use-create-template-dialog-viewmodel';
import { TemplateActionType } from '../actions/template-action-type';

export function CreateTemplateDialog() {
  const {
    name,
    canSubmit,
    showNameError,
    dispatch,
  } = useCreateTemplateDialogViewModel();

  function onDialogContentClick(e: MouseEvent<HTMLDivElement>) {
    e.stopPropagation();
  }

  function onNameInputChange(e: ChangeEvent<HTMLInputElement>) {
    dispatch({ type: TemplateActionType.TemplateCreateDialogNameTextOnChange, value: e.target.value });
  }

  function onDialogCancel() {
    dispatch({ type: TemplateActionType.TemplateCreateDialogCancelButtonOnClick });
  }

  function onDialogSubmit() {
    dispatch({ type: TemplateActionType.TemplateCreateDialogOkButtonOnClick });
  }

  return (
    <div className="dialog-overlay" onClick={onDialogCancel}>
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
            onClick={onDialogCancel}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn-primary"
            disabled={!canSubmit}
            onClick={onDialogSubmit}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
