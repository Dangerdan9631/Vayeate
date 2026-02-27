import type { CatalogReference } from '../../model/schemas';

interface TemplateCatalogsCardProps {
  catalogNames: string[];
  catalogVersionsByName: Record<string, CatalogReference[]>;
  includedCatalogMap: Map<string, string>;
  onToggleCatalog: (catalogName: string, include: boolean) => void;
  onChangeCatalogVersion: (catalogName: string, version: string) => void;
}

export function TemplateCatalogsCard({
  catalogNames,
  catalogVersionsByName,
  includedCatalogMap,
  onToggleCatalog,
  onChangeCatalogVersion,
}: TemplateCatalogsCardProps) {
  return (
    <div className="placeholder template-catalogs-card">
      <h2>Catalogs</h2>

      {catalogNames.length === 0 && (
        <p className="empty-hint">No catalogs available. Create one on the Catalogs tab.</p>
      )}

      {catalogNames.map((name) => {
        const included = includedCatalogMap.has(name);
        const selectedVersion = includedCatalogMap.get(name) ?? '';
        const versions = catalogVersionsByName[name] ?? [];

        return (
          <div key={name} className="template-catalog-row">
            <label className="template-catalog-check">
              <input
                type="checkbox"
                checked={included}
                onChange={(e) => onToggleCatalog(name, e.target.checked)}
              />
              <span className="template-catalog-name">{name}</span>
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
