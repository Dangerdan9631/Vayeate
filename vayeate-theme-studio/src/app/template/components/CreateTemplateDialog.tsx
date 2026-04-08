import { useCreateTemplateDialogViewModel } from '../viewmodel/use-create-template-dialog-viewmodel';

export function CreateTemplateDialog() {
  const {
    name,
    canSubmit,
    showNameError,
    handleSubmit,
    handleCancel,
    handleDialogContentClick,
    handleNameChange,
  } = useCreateTemplateDialogViewModel();

  return (
    <div className="dialog-overlay" onClick={handleCancel}>
      <div className="dialog-content" onClick={handleDialogContentClick}>
        <h3>Create New Template</h3>

        <label className="field-row">
          <span className="field-label">Name</span>
          <input
            className="field-input"
            type="text"
            value={name}
            placeholder="my-template"
            onChange={(e) => handleNameChange(e.target.value)}
          />
        </label>
        {showNameError && (
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
