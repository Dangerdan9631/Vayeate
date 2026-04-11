import type { ChangeEvent } from 'react';
import { useTemplatesCardViewModel } from '../viewmodel/use-templates-card-viewmodel';

export function TemplatesCard() {
  const {
    templateNames,
    selectedName,
    versionsForSelectedName,
    selectedRef,
    onSelectName,
    onSelectVersion,
    onCreateClick,
    isCreating,
  } = useTemplatesCardViewModel();

  function handleNameChange(value: string) {
    if (value) {
      onSelectName(value);
    }
  }

  function handleVersionChange(value: string) {
    onSelectVersion(value);
  }

  function onNameSelectChange(e: ChangeEvent<HTMLSelectElement>) {
    handleNameChange(e.target.value);
  }

  function onVersionSelectChange(e: ChangeEvent<HTMLSelectElement>) {
    handleVersionChange(e.target.value);
  }

  return (
    <div className="catalogs-card placeholder">
      <h2>Templates</h2>

      <label className="field-row">
        <span className="field-label">Name</span>
        <select
          className="field-select"
          value={selectedName ?? ''}
          onChange={onNameSelectChange}
        >
          <option value="" disabled>
            Select a template…
          </option>
          {templateNames.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </label>

      {selectedName && versionsForSelectedName.length > 0 && (
        <label className="field-row">
          <span className="field-label">Version</span>
          <select
            className="field-select"
            value={selectedRef?.version ?? ''}
            onChange={onVersionSelectChange}
          >
            {versionsForSelectedName.map((ref) => (
              <option key={ref.version} value={ref.version}>
                {ref.version}
              </option>
            ))}
          </select>
        </label>
      )}

      <button
        type="button"
        className="create-catalog-btn"
        disabled={isCreating}
        onClick={onCreateClick}
      >
        {isCreating ? 'Creating…' : 'Create new template'}
      </button>
    </div>
  );
}
