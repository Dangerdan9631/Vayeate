import type { MouseEvent } from 'react';
import { useAppDispatch, useCatalogsState } from '../context/slice-contexts';
import type { CatalogType } from '../../../model/schemas';
import { CatalogActionType } from '../../actions/action-types';

const NAME_REGEX = /^[a-zA-Z0-9-]+$/;

interface CreateCatalogDialogProps {
  onCancel?: () => void;
}

export function CreateCatalogDialog({ onCancel }: CreateCatalogDialogProps) {
  const dispatch = useAppDispatch();
  const { createFormName: name, createFormType: type } = useCatalogsState();

  const nameValid = name.length > 0 && NAME_REGEX.test(name);
  const canSubmit = nameValid;

  function handleSubmit() {
    if (!canSubmit) return;
    dispatch({ type: CatalogActionType.CatalogCreateDialogOkButtonOnClick });
  }

  function handleCancel() {
    if (onCancel) {
      onCancel();
      return;
    }
    dispatch({ type: CatalogActionType.CatalogCreateDialogCancelButtonOnClick });
  }

  function handleDialogContentClick(e: MouseEvent<HTMLDivElement>) {
    e.stopPropagation();
  }

  function handleNameChange(value: string) {
    dispatch({ type: CatalogActionType.CatalogCreateDialogNameTextOnChange, value });
  }

  function handleTypeChange(value: CatalogType) {
    dispatch({ type: CatalogActionType.CatalogCreateDialogTypeListOnCommit, value });
  }

  return (
    <div className="dialog-overlay" onClick={handleCancel}>
      <div className="dialog-content" onClick={handleDialogContentClick}>
        <h3>Create New Catalog</h3>

        <label className="field-row">
          <span className="field-label">Name</span>
          <input
            className="field-input"
            type="text"
            value={name}
            placeholder="my-catalog"
            onChange={(e) => handleNameChange(e.target.value)}
          />
        </label>
        {name.length > 0 && !nameValid && (
          <p className="field-error">Alphanumeric characters and hyphens only.</p>
        )}

        <label className="field-row">
          <span className="field-label">Type</span>
          <select
            className="field-select"
            value={type}
            onChange={(e) => handleTypeChange(e.target.value as CatalogType)}
          >
            <option value="manual">Manual</option>
            <option value="remote">Remote</option>
          </select>
        </label>

        <div className="dialog-actions">
          <button type="button" className="btn-secondary" onClick={handleCancel}>
            Cancel
          </button>
          <button type="button" className="btn-primary" disabled={!canSubmit} onClick={handleSubmit}>
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
