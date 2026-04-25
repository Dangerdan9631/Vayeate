import { useTemplateDetailsCardViewModel } from './use-template-details-card-viewmodel';

export function TemplateDetailsCard() {
  const { template, canLock, canShowLockButton, lockButtonTitle, onDeleteVersionClick, onLockClick } =
    useTemplateDetailsCardViewModel();

  if (!template) return null;

  return (
    <div className="catalog-details-card placeholder">
      <h2>Template Details</h2>

      <div className="detail-grid">
        <span className="detail-label">Name</span>
        <span className="detail-value">{template.name}</span>

        <span className="detail-label">Version</span>
        <span className="detail-value">{template.version}</span>

        <span className="detail-label">Locked</span>
        <span className="detail-value">{template.locked ? 'Yes' : 'No'}</span>

        <span className="detail-label">Catalogs</span>
        <span className="detail-value">{template.catalogRefs.length}</span>

        <span className="detail-label">Color variables</span>
        <span className="detail-value">{template.colorVariables.length}</span>

        <span className="detail-label">Contrast variables</span>
        <span className="detail-value">{template.contrastVariables.length}</span>

        <span className="detail-label">Mappings</span>
        <span className="detail-value">{template.mappings.length}</span>
      </div>

      <div className="details-actions">
        <button type="button" className="btn-danger" onClick={onDeleteVersionClick}>
          Delete version
        </button>
        {canShowLockButton && (
          <button
            type="button"
            className="btn-secondary"
            disabled={!canLock}
            onClick={onLockClick}
            title={lockButtonTitle}
          >
            Lock
          </button>
        )}
      </div>
    </div>
  );
}
