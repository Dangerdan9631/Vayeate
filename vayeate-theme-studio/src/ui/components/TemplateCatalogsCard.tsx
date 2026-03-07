import type { CatalogReference } from '../../model/schemas';

interface TemplateCatalogsCardProps {
  catalogNames: string[];
  catalogVersionsByName: Record<string, CatalogReference[]>;
  includedCatalogMap: Map<string, string>;
  isLatestVersion: boolean;
  includedCatalogNamesWithUpdates: string[];
  onToggleCatalog: (catalogName: string, include: boolean) => void;
  onChangeCatalogVersion: (catalogName: string, version: string) => void;
  onUpdateAll: () => void;
}

export function TemplateCatalogsCard({
  catalogNames,
  catalogVersionsByName,
  includedCatalogMap,
  isLatestVersion,
  includedCatalogNamesWithUpdates,
  onToggleCatalog,
  onChangeCatalogVersion,
  onUpdateAll,
}: TemplateCatalogsCardProps) {
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
            onClick={onUpdateAll}
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
              <input
                type="checkbox"
                checked={included}
                onChange={(e) => onToggleCatalog(name, e.target.checked)}
              />
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
                onChange={(e) => onChangeCatalogVersion(name, e.target.value)}
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
