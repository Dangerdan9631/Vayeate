import { useAppDispatch } from '../context/slice-contexts';

const NAME_REGEX = /^[a-zA-Z0-9-]+$/;

interface CreateTemplateDialogProps {
  createFormName: string;
  setCreateFormName: (value: string) => void;
  onCancel: () => void;
  onCreate: (params: { name: string }) => void;
}

export function CreateTemplateDialog({
  createFormName,
  setCreateFormName,
  onCancel,
  onCreate,
}: CreateTemplateDialogProps) {
  const dispatch = useAppDispatch();

  const nameValid = createFormName.length > 0 && NAME_REGEX.test(createFormName);
  const canSubmit = nameValid;

  function handleSubmit() {
    if (!canSubmit) return;
    onCreate({ name: createFormName });
  }

  return (
    <div className="dialog-overlay" onClick={onCancel}>
      <div className="dialog-content" onClick={(e) => e.stopPropagation()}>
        <h3>Create New Template</h3>

        <label className="field-row">
          <span className="field-label">Name</span>
          <input
            className="field-input"
            type="text"
            value={createFormName}
            placeholder="my-template"
            onChange={(e) => setCreateFormName(e.target.value)}
          />
        </label>
        {createFormName.length > 0 && !nameValid && (
          <p className="field-error">Alphanumeric characters and hyphens only.</p>
        )}

        <div className="dialog-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => {
              dispatch({ type: 'TEMPLATE_CREATE_DIALOG_CANCEL_BUTTON_ON_CLICK' });
              onCancel();
            }}
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
