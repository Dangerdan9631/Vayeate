import { useAppDispatch } from '../context/slice-contexts';
import type { CatalogName, CatalogReference } from '../../model/schemas';

interface TemplateCatalogsCardProps {
  catalogNames: string[];
  catalogVersionsByName: Record<string, CatalogReference[]>;
  includedCatalogMap: Map<string, string>;
  isLatestVersion: boolean;
  includedCatalogNamesWithUpdates: string[];
}

export function TemplateCatalogsCard({
  catalogNames,
  catalogVersionsByName,
  includedCatalogMap,
  isLatestVersion,
  includedCatalogNamesWithUpdates,
}: TemplateCatalogsCardProps) {
  const dispatch = useAppDispatch();
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
            onClick={() => {
              dispatch({ type: 'TEMPLATE_DETAILS_UPDATE_ALL_BUTTON_ON_CLICK' });
            }}
          >
            Update All
          </button>
        )}
      </div>

      {catalogNames.length === 0 && (
        <p className="empty-hint">No catalogs available. Create one on the Catalogs tab.</p>
      )}

      {catalogNames.map((name) => {
        const included = includedCatalogMap.has(name);
        const selectedVersion = includedCatalogMap.get(name) ?? '';
        const versions = catalogVersionsByName[name] ?? [];
        const hasUpdate =
          included &&
          isLatestVersion &&
          includedCatalogNamesWithUpdates.includes(name);

        return (
          <div key={name} className="template-catalog-row">
            <label className="template-catalog-check">
              <button
                type="button"
                role="checkbox"
                aria-checked={included}
                aria-label={`Include catalog ${name}`}
                className="checkbox-icon-btn"
                onClick={(e) => {
                  e.preventDefault();
                  dispatch({
                    type: 'TEMPLATE_DETAILS_CATALOG_CHECKBOX_ON_TOGGLE',
                    catalogName: name as CatalogName,
                    checked: !included,
                  });
                }}
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
                onChange={(e) => {
                  const value = e.target.value;
                  dispatch({
                    type: 'TEMPLATE_DETAILS_CATALOG_VERSION_LIST_ON_COMMIT',
                    catalogName: name as CatalogName,
                    value,
                  });
                }}
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
