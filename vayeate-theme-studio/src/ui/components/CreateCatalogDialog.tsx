import { useState } from 'react';

const NAME_REGEX = /^[a-zA-Z0-9-]+$/;

interface CreateCatalogDialogProps {
  onCancel: () => void;
  onCreate: (params: { name: string; type: 'manual' | 'remote' }) => void;
}

export function CreateCatalogDialog({ onCancel, onCreate }: CreateCatalogDialogProps) {
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
            onChange={(e) => setName(e.target.value)}
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
            onChange={(e) => setType(e.target.value as 'manual' | 'remote')}
          >
            <option value="manual">Manual</option>
            <option value="remote">Remote</option>
          </select>
        </label>

        <div className="dialog-actions">
          <button type="button" className="btn-secondary" onClick={onCancel}>
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
