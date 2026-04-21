import type { ChangeEvent } from 'react';
import { useCatalogsCardViewModel } from './use-catalogs-card-viewmodel';

export function CatalogsCard() {
  const {
    selectedName,
    catalogNames,
    selectedVersion,
    catalogVersionNames,
    onCatalogsListCommit,
    onCatalogVersionsListCommit,
    onCreateCatalogClick
  } = useCatalogsCardViewModel();

  function onSelectedCatalogChange(e: ChangeEvent<HTMLSelectElement>) {
    onCatalogsListCommit(e.target.value);
  }

  function onSelectedVersionChange(e: ChangeEvent<HTMLSelectElement>) {
    onCatalogVersionsListCommit(e.target.value);
  }

  return (
    <div className="catalogs-card placeholder">
      <h2>Catalogs</h2>

      <label className="field-row">
        <span className="field-label">Name</span>
        <select
          className="field-select"
          value={selectedName}
          onChange={onSelectedCatalogChange}
        >
          <option value="" disabled>
            Select a catalog…
          </option>
          {catalogNames.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </label>

      {selectedName && (
        <label className="field-row">
          <span className="field-label">Version</span>
          <select
            className="field-select"
            value={selectedVersion}
            onChange={onSelectedVersionChange}
          >
            {catalogVersionNames.map((version) => (
              <option key={version} value={version}>
                {version}
              </option>
            ))}
          </select>
        </label>
      )}

      <button
        type="button"
        className="create-catalog-btn"
        onClick={onCreateCatalogClick}
      >
        'Create new catalog'
      </button>
    </div>
  );
}
