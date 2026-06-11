import type { ChangeEvent, KeyboardEvent } from 'react';
import { useGroupsCardViewModel } from './use-groups-card-viewmodel';

/**
 * Renders the template group list with add and remove controls.
 * @returns Groups card UI wired to its viewmodel.
 */
export function GroupsCard() {
  const {
    template,
    groupRows,
    canEdit,
    addGroupName,
    canAddGroup,
    onRemoveGroupClick,
    onAddGroupNameChange,
    onAddGroupClick,
  } = useGroupsCardViewModel();

  if (!template) return null;

  function onAddGroupNameInputChange(e: ChangeEvent<HTMLInputElement>) {
    onAddGroupNameChange(e.target.value);
  }

  function onAddGroupNameKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      onAddGroupClick();
    }
  }

  return (
    <div className="tokens-card placeholder">
      <h2>Groups</h2>
      {canEdit && (
        <div className="variable-row variable-add-row">
          <input
            className="token-input"
            type="text"
            placeholder="Group name…"
            value={addGroupName}
            onChange={onAddGroupNameInputChange}
            onKeyDown={onAddGroupNameKeyDown}
          />
          <button
            type="button"
            className="btn-icon btn-add-icon"
            title="Add group"
            disabled={!canAddGroup}
            onClick={onAddGroupClick}
          >
            <span className="material-symbols-outlined">add</span>
          </button>
        </div>
      )}
      <div className="tree-children">
        {groupRows.length === 0 && (
          <div className="empty-hint">No groups defined.</div>
        )}
        {groupRows.map((group) => {
          function onRemoveGroupButtonClick() {
            onRemoveGroupClick(group.name);
          }
          return (
            <div key={group.name} className="variable-row">
              <span className="variable-name">{group.name}</span>
              {canEdit && (
                <button
                  type="button"
                  className="btn-icon btn-danger-icon"
                  title={group.removeButtonTitle}
                  disabled={group.isInUse}
                  onClick={onRemoveGroupButtonClick}
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
