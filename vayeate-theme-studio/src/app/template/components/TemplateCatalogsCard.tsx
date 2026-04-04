import { useAppDispatch } from '../../core/context/app-context-hooks';
import type { CatalogName, CatalogReference } from '../../../model/schemas';
import { TemplateActionType } from '../actions/template-action-type';

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
  const handleUpdateAll = () =>
    dispatch({ type: TemplateActionType.TemplateDetailsUpdateAllButtonOnClick });
  const handleCatalogToggle = (name: string, checked: boolean) => {
    dispatch({
      type: TemplateActionType.TemplateDetailsCatalogCheckboxOnToggle,
      catalogName: name as CatalogName,
      checked,
    });
  };
  const handleCatalogVersionChange = (name: string, value: string) => {
    dispatch({
      type: TemplateActionType.TemplateDetailsCatalogVersionListOnCommit,
      catalogName: name as CatalogName,
      value,
    });
  };

  return (
    <div className="placeholder template-catalogs-card">
      <div className="template-catalogs-card-header">
        <h2>Catalogs</h2>
        {showUpdateAll && (
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={handleUpdateAll}
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
                  handleCatalogToggle(name, !included);
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
                  handleCatalogVersionChange(name, e.target.value);
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
