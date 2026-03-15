import { useAppDispatch, useCatalogsState } from '../context/slice-contexts';
import type { CatalogType } from '../../model/schemas';

const NAME_REGEX = /^[a-zA-Z0-9-]+$/;

interface CreateCatalogDialogProps {
  onCancel?: () => void;
  onCreate?: (params: { name: string; type: 'manual' | 'remote' }) => void;
}

export function CreateCatalogDialog({ onCancel, onCreate: _onCreate }: CreateCatalogDialogProps) {
  const dispatch = useAppDispatch();
  const { createFormName: name, createFormType: type } = useCatalogsState();

  const nameValid = name.length > 0 && NAME_REGEX.test(name);
  const canSubmit = nameValid;

  function handleSubmit() {
    if (!canSubmit) return;
    dispatch({ type: 'CATALOG_CREATE_DIALOG_OK_BUTTON_ON_CLICK', params: { name, type } });
  }

  function handleCancel() {
    dispatch({ type: 'CATALOG_CREATE_DIALOG_CANCEL_BUTTON_ON_CLICK' });
    onCancel?.();
  }

  return (
    <div className="dialog-overlay" onClick={handleCancel}>
      <div className="dialog-content" onClick={(e) => e.stopPropagation()}>
        <h3>Create New Catalog</h3>

        <label className="field-row">
          <span className="field-label">Name</span>
          <input
            className="field-input"
            type="text"
            value={name}
            placeholder="my-catalog"
            onChange={(e) =>
              dispatch({ type: 'CATALOG_CREATE_DIALOG_NAME_TEXT_ON_CHANGE', value: e.target.value })
            }
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
            onChange={(e) =>
              dispatch({
                type: 'CATALOG_CREATE_DIALOG_TYPE_LIST_ON_COMMIT',
                value: e.target.value as CatalogType,
              })
            }
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
