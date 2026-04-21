import type { ChangeEvent, MouseEvent } from 'react';
import { useCreateCatalogDialogViewModel } from './use-create-catalog-dialog-viewmodel';
import { CatalogType } from '../../../../model/schema/primitives';

export function CreateCatalogDialog() {
  const {
    name,
    type,
    hasError,
    errorMessage,
    canSubmit,
    onNameChange,
    onTypeChange,
    onOkClick,
    onCancelClick,
  } = useCreateCatalogDialogViewModel();

  function onDialogContentClick(e: MouseEvent<HTMLDivElement>) {
    // Prevent the click from propagating to the overlay.
    e.stopPropagation();
  }

  function onNameInputChange(e: ChangeEvent<HTMLInputElement>) {
    onNameChange(e.target.value);
  }

  function onTypeSelectChange(e: ChangeEvent<HTMLSelectElement>) {
    onTypeChange(e.target.value as CatalogType);
  }

  return (
    <div className="dialog-overlay" onClick={onCancelClick}>
      <div className="dialog-content" onClick={onDialogContentClick}>
        <h3>Create New Catalog</h3>

        <label className="field-row">
          <span className="field-label">Name</span>
          <input
            className="field-input"
            type="text"
            value={name}
            placeholder="my-catalog"
            onChange={onNameInputChange}
          />
        </label>
        {hasError && (
          <p className="field-error">{errorMessage}</p>
        )}

        <label className="field-row">
          <span className="field-label">Type</span>
          <select
            className="field-select"
            value={type}
            onChange={onTypeSelectChange}
          >
            <option value="manual">Manual</option>
            <option value="remote">Remote</option>
          </select>
        </label>

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
