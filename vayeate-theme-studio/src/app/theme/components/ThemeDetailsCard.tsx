import type { ChangeEvent } from 'react';
import { useThemeDetailsCardViewModel } from '../viewmodel/use-theme-details-card-viewmodel';

export function ThemeDetailsCard() {
  const {
    theme,
    templateNamesList,
    templateVersionsByName,
    selectedTemplateName,
    selectedTemplateVersion,
    canGenerate,
    generateResult,
    onDeleteVersion,
    onGenerate,
    onBumpVersion,
    onChangeTemplate,
    onChangeTemplateVersion,
  } = useThemeDetailsCardViewModel();

  if (!theme) return null;

  const versionsForTemplate = selectedTemplateName
    ? templateVersionsByName[selectedTemplateName] ?? []
    : [];

  function onTemplateSelectChange(e: ChangeEvent<HTMLSelectElement>) {
    const name = e.target.value;
    if (name) {
      const version = templateVersionsByName[name]?.[0]?.version ?? '';
      onChangeTemplate(name, version);
    }
  }

  function onTemplateVersionSelectChange(e: ChangeEvent<HTMLSelectElement>) {
    onChangeTemplateVersion(e.target.value);
  }

  return (
    <div className="catalog-details-card placeholder">
      <h2>Theme Details</h2>

      <div className="detail-grid">
        <span className="detail-label">Name</span>
        <span className="detail-value">{theme.name}</span>

        <span className="detail-label">Version</span>
        <span className="detail-value">{theme.version}</span>

        <span className="detail-label">Color variables</span>
        <span className="detail-value">{theme.colorAssignments.length}</span>

        <span className="detail-label">Contrast variables</span>
        <span className="detail-value">{theme.contrastAssignments.length}</span>
      </div>

      <div className="theme-template-row">
        <label className="field-row theme-template-name">
          <span className="field-label">Template</span>
          <select
            className="field-select"
            value={selectedTemplateName ?? ''}
            onChange={onTemplateSelectChange}
          >
            <option value="" disabled>
              Select a template…
            </option>
            {templateNamesList.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </label>

        {selectedTemplateName && versionsForTemplate.length > 0 && (
          <label className="field-row theme-template-version">
            <span className="field-label">Version</span>
            <select
              className="field-select"
              value={selectedTemplateVersion ?? ''}
              onChange={onTemplateVersionSelectChange}
            >
              {versionsForTemplate.map((ref) => (
                <option key={ref.version} value={ref.version}>
                  {ref.version}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      {generateResult && (
        <p
          className={generateResult.success ? 'theme-generate-success' : 'theme-generate-error'}
          role="status"
          aria-live="polite"
        >
          {generateResult.message}
        </p>
      )}

      <div className="details-actions">
        <button type="button" className="btn-danger" onClick={onDeleteVersion}>
          Delete version
        </button>
        <button
          type="button"
          className="btn-secondary"
          onClick={onBumpVersion}
          title="Create a new version (e.g. 1.0.0 → 1.0.1)"
        >
          Increment Version
        </button>
        <button
          type="button"
          className="btn-primary"
          disabled={!canGenerate}
          onClick={onGenerate}
          title={canGenerate ? 'Generate theme' : 'All variables must have values assigned'}
        >
          Generate
        </button>
      </div>
    </div>
  );
}
