import type { ChangeEvent, MouseEvent } from 'react';
import { useTemplateCatalogsCardViewModel } from './use-template-catalogs-card-viewmodel';

export function TemplateCatalogsCard() {
  const {
    template,
    catalogNamesList,
    catalogVersionsByName,
    includedCatalogMap,
    isLatestVersion,
    includedCatalogNamesWithUpdates,
    updateAllCatalogsToLatest,
    toggleCatalog,
    changeCatalogVersion,
  } = useTemplateCatalogsCardViewModel();

  if (!template) return null;

  const showUpdateAll =
    isLatestVersion && includedCatalogNamesWithUpdates.length > 0;

  return (
    <div className="placeholder template-catalogs-card">
      <div className="template-catalogs-card-header">
        <h2>Catalogs</h2>
        {showUpdateAll && (
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={updateAllCatalogsToLatest}
          >
            Update All
          </button>
        )}
      </div>

      {catalogNamesList.length === 0 && (
        <p className="empty-hint">No catalogs available. Create one on the Catalogs tab.</p>
      )}

      {catalogNamesList.map((name) => {
        const included = includedCatalogMap.has(name);
        const selectedVersion = includedCatalogMap.get(name) ?? '';
        const versions = catalogVersionsByName[name] ?? [];
        const hasUpdate =
          included &&
          isLatestVersion &&
          includedCatalogNamesWithUpdates.includes(name);

        function onCatalogCheckboxClick(e: MouseEvent<HTMLButtonElement>) {
          e.preventDefault();
          toggleCatalog(name);
        }

        function onCatalogVersionSelectChange(e: ChangeEvent<HTMLSelectElement>) {
          changeCatalogVersion(name, e.target.value);
        }

        return (
          <div key={name} className="template-catalog-row">
            <label className="template-catalog-check">
              <button
                type="button"
                role="checkbox"
                aria-checked={included}
                aria-label={`Include catalog ${name}`}
                className="checkbox-icon-btn"
                onClick={onCatalogCheckboxClick}
              >
                <span className="material-symbols-outlined" aria-hidden>
                  {included ? 'check_box' : 'check_box_outline_blank'}
                </span>
              </button>
              <span className="template-catalog-name">{name}</span>
              {hasUpdate && (
                <span
                  className="material-symbols-outlined catalog-update-icon"
                  title="Update available"
                  aria-hidden
                >
                  system_update
                </span>
              )}
            </label>
            {included && versions.length > 0 && (
              <select
                className="field-select template-catalog-version"
                value={selectedVersion}
                onChange={onCatalogVersionSelectChange}
              >
                {versions.map((ref) => (
                  <option key={ref.version} value={ref.version}>
                    {ref.version}
                  </option>
                ))}
              </select>
            )}
          </div>
        );
      })}
    </div>
  );
}
