import type { ChangeEvent } from 'react';
import { useThemesCardViewModel } from './use-themes-card-viewmodel';

/**
 * Renders the Themes Card UI for the theme editor.
 */
export function ThemesCard() {
  const {
    themeNames,
    selectedName,
    versionsForSelectedName,
    selectedRef,
    onSelectName,
    onSelectVersion,
    onCreateClick,
    onDuplicateClick,
    isCreating,
    canDuplicate,
  } = useThemesCardViewModel();

  function onNameSelectChange(e: ChangeEvent<HTMLSelectElement>) {
    onSelectName(e.target.value);
  }

  function onVersionSelectChange(e: ChangeEvent<HTMLSelectElement>) {
    onSelectVersion(e.target.value);
  }

  return (
    <div className="catalogs-card placeholder">
      <h2>Themes</h2>

      <label className="field-row">
        <span className="field-label">Name</span>
        <select
          className="field-select"
          value={selectedName ?? ''}
          onChange={onNameSelectChange}
        >
          <option value="" disabled>
            Select a theme…
          </option>
          {themeNames.map((name) => (
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
        {isCreating ? 'Creating…' : 'Create new theme'}
      </button>

      {canDuplicate && (
        <button
          type="button"
          className="create-catalog-btn"
          disabled={isCreating}
          onClick={onDuplicateClick}
        >
          {isCreating ? 'Creating…' : 'Duplicate theme'}
        </button>
      )}
    </div>
  );
}
