import { useState } from 'react';
import { useAppDispatchV2 } from '../context/slice-contexts';
import type { CatalogType } from '../../model/schemas';

const NAME_REGEX = /^[a-zA-Z0-9-]+$/;

interface CreateCatalogDialogProps {
  onCancel: () => void;
  onCreate: (params: { name: string; type: 'manual' | 'remote' }) => void;
}

export function CreateCatalogDialog({ onCancel, onCreate }: CreateCatalogDialogProps) {
  const dispatchV2 = useAppDispatchV2();
  const [name, setName] = useState('');
  const [type, setType] = useState<'manual' | 'remote'>('manual');

  const nameValid = name.length > 0 && NAME_REGEX.test(name);
  const canSubmit = nameValid;

  function handleSubmit() {
    if (!canSubmit) return;
    onCreate({ name, type });
  }

  return (
    <div className="dialog-overlay" onClick={onCancel}>
      <div className="dialog-content" onClick={(e) => e.stopPropagation()}>
        <h3>Create New Catalog</h3>

        <label className="field-row">
          <span className="field-label">Name</span>
          <input
            className="field-input"
            type="text"
            value={name}
            placeholder="my-catalog"
            onChange={(e) => {
              const value = e.target.value;
              setName(value);
              dispatchV2({ type: 'CATALOG_CREATE_DIALOG_NAME_TEXT_ON_CHANGE', value });
            }}
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
            onChange={(e) => {
              const value = e.target.value as CatalogType;
              setType(value);
              dispatchV2({ type: 'CATALOG_CREATE_DIALOG_TYPE_LIST_ON_COMMIT', value });
            }}
          >
            <option value="manual">Manual</option>
            <option value="remote">Remote</option>
          </select>
        </label>

        <div className="dialog-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => {
              dispatchV2({ type: 'CATALOG_CREATE_DIALOG_CANCEL_BUTTON_ON_CLICK' });
              onCancel();
            }}
          >
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
