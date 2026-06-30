import type { ChangeEvent } from 'react';
import { useTemplatesCardViewModel } from './use-templates-card-viewmodel';

/**
 * Renders the template name/version picker and create button.
 * @returns Templates list card UI wired to its viewmodel.
 */
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

  function onNameSelectChange(e: ChangeEvent<HTMLSelectElement>) {
    onSelectName(e.target.value);
  }

  function onVersionSelectChange(e: ChangeEvent<HTMLSelectElement>) {
    onSelectVersion(e.target.value);
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
