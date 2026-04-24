import type { ChangeEvent, MouseEvent } from 'react';
import { useTemplateCatalogsCardViewModel } from './use-template-catalogs-card-viewmodel';

export function TemplateCatalogsCard() {
  const {
    template,
    catalogRows,
    shouldShowUpdateAllCatalogsButton,
    onUpdateAllCatalogsClick,
    onToggleCatalogClick,
    onCatalogVersionChange,
  } = useTemplateCatalogsCardViewModel();

  if (!template) return null;

  return (
    <div className="placeholder template-catalogs-card">
      <div className="template-catalogs-card-header">
        <h2>Catalogs</h2>
        {shouldShowUpdateAllCatalogsButton && (
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={onUpdateAllCatalogsClick}
          >
            Update All
          </button>
        )}
      </div>

      {catalogRows.length === 0 && (
        <p className="empty-hint">No catalogs available. Create one on the Catalogs tab.</p>
      )}

      {catalogRows.map((catalog) => {
        function onCatalogCheckboxClick(e: MouseEvent<HTMLButtonElement>) {
          e.preventDefault();
          onToggleCatalogClick(catalog.name);
        }

        function onCatalogVersionSelectChange(e: ChangeEvent<HTMLSelectElement>) {
          onCatalogVersionChange(catalog.name, e.target.value);
        }

        return (
          <div key={catalog.name} className="template-catalog-row">
            <label className="template-catalog-check">
              <button
                type="button"
                role="checkbox"
                aria-checked={catalog.isIncluded}
                aria-label={`Include catalog ${catalog.name}`}
                className="checkbox-icon-btn"
                onClick={onCatalogCheckboxClick}
              >
                <span className="material-symbols-outlined" aria-hidden>
                  {catalog.isIncluded ? 'check_box' : 'check_box_outline_blank'}
                </span>
              </button>
              <span className="template-catalog-name">{catalog.name}</span>
              {catalog.hasUpdate && (
                <span
                  className="material-symbols-outlined catalog-update-icon"
                  title="Update available"
                  aria-hidden
                >
                  system_update
                </span>
              )}
            </label>
            {catalog.isIncluded && catalog.versions.length > 0 && (
              <select
                className="field-select template-catalog-version"
                value={catalog.selectedVersion}
                onChange={onCatalogVersionSelectChange}
              >
                {catalog.versions.map((ref) => (
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
