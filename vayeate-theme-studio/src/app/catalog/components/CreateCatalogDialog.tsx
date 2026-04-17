import type { ChangeEvent } from 'react';
import { useCreateCatalogDialogViewModel } from '../viewmodel/use-create-catalog-dialog-viewmodel';
import { CatalogType } from '../../../model/schema/primitives';

export function CreateCatalogDialog() {
  const {
    name,
    type,
    nameValid,
    canSubmit,
    handleSubmit,
    handleCancel,
    handleDialogContentClick,
    handleNameChange,
    handleTypeChange,
  } = useCreateCatalogDialogViewModel();

  const showNameError = name.length > 0 && !nameValid;

  function onNameInputChange(e: ChangeEvent<HTMLInputElement>) {
    handleNameChange(e.target.value);
  }

  function onTypeSelectChange(e: ChangeEvent<HTMLSelectElement>) {
    handleTypeChange(e.target.value as CatalogType);
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
            onChange={onNameInputChange}
          />
        </label>
        {showNameError && (
          <p className="field-error">Alphanumeric characters and hyphens only.</p>
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
