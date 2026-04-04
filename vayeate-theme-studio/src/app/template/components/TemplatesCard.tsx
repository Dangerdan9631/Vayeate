import type { TemplateReference } from '../../../model/schemas';

interface TemplatesCardProps {
  templateNames: string[];
  selectedName: string | null;
  versionsForSelectedName: TemplateReference[];
  selectedRef: TemplateReference | null;
  onSelectName: (name: string) => void;
  onSelectVersion: (version: string) => void;
  onCreateClick: () => void;
  isCreating: boolean;
}

export function TemplatesCard({
  templateNames,
  selectedName,
  versionsForSelectedName,
  selectedRef,
  onSelectName,
  onSelectVersion,
  onCreateClick,
  isCreating,
}: TemplatesCardProps) {
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
      <h2>Templates</h2>

      <label className="field-row">
        <span className="field-label">Name</span>
        <select
          className="field-select"
          value={selectedName ?? ''}
          onChange={(e) => handleNameChange(e.target.value)}
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
        {isCreating ? 'Creating…' : 'Create new template'}
      </button>
    </div>
  );
}
