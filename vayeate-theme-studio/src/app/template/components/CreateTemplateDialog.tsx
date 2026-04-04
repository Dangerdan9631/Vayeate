import type { MouseEvent } from 'react';
import { useAppDispatch, useTemplatesState } from '../../app/context/app-context-hooks';
import { TemplateActionType } from '../actions/template-action-type';

const NAME_REGEX = /^[a-zA-Z0-9-]+$/;

interface CreateTemplateDialogProps {
  onCancel?: () => void;
}

export function CreateTemplateDialog({ onCancel }: CreateTemplateDialogProps) {
  const dispatch = useAppDispatch();
  const { createFormName } = useTemplatesState();

  const nameValid = createFormName.length > 0 && NAME_REGEX.test(createFormName);
  const canSubmit = nameValid;

  function handleSubmit() {
    if (!canSubmit) return;
    dispatch({ type: TemplateActionType.TemplateCreateDialogOkButtonOnClick, params: { name: createFormName } });
  }

  function handleCancel() {
    if (onCancel) {
      onCancel();
      return;
    }
    dispatch({ type: TemplateActionType.TemplateCreateDialogCancelButtonOnClick });
  }

  function handleDialogContentClick(e: MouseEvent<HTMLDivElement>) {
    e.stopPropagation();
  }

  function handleNameChange(value: string) {
    dispatch({ type: TemplateActionType.TemplateCreateDialogNameTextOnChange, value });
  }

  return (
    <div className="dialog-overlay" onClick={handleCancel}>
      <div className="dialog-content" onClick={handleDialogContentClick}>
        <h3>Create New Template</h3>

        <label className="field-row">
          <span className="field-label">Name</span>
          <input
            className="field-input"
            type="text"
            value={createFormName}
            placeholder="my-template"
            onChange={(e) => handleNameChange(e.target.value)}
          />
        </label>
        {createFormName.length > 0 && !nameValid && (
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
