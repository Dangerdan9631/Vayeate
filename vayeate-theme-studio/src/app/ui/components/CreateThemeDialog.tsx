import type { MouseEvent } from 'react';
import { useAppDispatch, useThemesState } from '../context/app-context-hooks';
import { ThemeActionType } from '../../actions/action-types';

const NAME_REGEX = /^[a-zA-Z0-9-]+$/;

interface CreateThemeDialogProps {
  onCancel?: () => void;
}

export function CreateThemeDialog({ onCancel }: CreateThemeDialogProps) {
  const dispatch = useAppDispatch();
  const { createFormName: name } = useThemesState();

  const nameValid = name.length > 0 && NAME_REGEX.test(name);
  const canSubmit = nameValid;

  function handleSubmit() {
    if (!canSubmit) return;
    dispatch({ type: ThemeActionType.ThemeCreateDialogOkButtonOnClick, params: { name } });
  }

  function handleCancel() {
    if (onCancel) {
      onCancel();
      return;
    }
    dispatch({ type: ThemeActionType.ThemeCreateDialogCancelButtonOnClick });
  }

  function handleDialogContentClick(e: MouseEvent<HTMLDivElement>) {
    e.stopPropagation();
  }

  function handleNameChange(value: string) {
    dispatch({ type: ThemeActionType.ThemeCreateDialogNameTextOnChange, value });
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
            onChange={(e) => handleNameChange(e.target.value)}
          />
        </label>
        {name.length > 0 && !nameValid && (
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
