import type { CatalogReference } from '../../../../model/schemas';

interface CatalogsCardProps {
  catalogNames: string[];
  selectedName: string | null;
  versionsForSelectedName: CatalogReference[];
  selectedRef: CatalogReference | null;
  onSelectName: (name: string) => void;
  onSelectVersion: (version: string) => void;
  onCreateClick: () => void;
  isCreating: boolean;
}

export function CatalogsCard({
  catalogNames,
  selectedName,
  versionsForSelectedName,
  selectedRef,
  onSelectName,
  onSelectVersion,
  onCreateClick,
  isCreating,
}: CatalogsCardProps) {
  function handleNameChange(value: string) {
    if (value) {
      onSelectName(value);
    }
  }

  function handleVersionChange(value: string) {
    onSelectVersion(value);
  }

  return (
    <div className="catalogs-card placeholder">
      <h2>Catalogs</h2>

      <label className="field-row">
        <span className="field-label">Name</span>
        <select
          className="field-select"
          value={selectedName ?? ''}
          onChange={(e) => handleNameChange(e.target.value)}
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

      {selectedName && versionsForSelectedName.length > 0 && (
        <label className="field-row">
          <span className="field-label">Version</span>
          <select
            className="field-select"
            value={selectedRef?.version ?? ''}
            onChange={(e) => handleVersionChange(e.target.value)}
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
        {isCreating ? 'Creating…' : 'Create new catalog'}
      </button>
    </div>
  );
}
