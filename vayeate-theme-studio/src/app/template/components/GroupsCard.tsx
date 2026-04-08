import { useGroupsCardViewModel } from '../viewmodel/use-groups-card-viewmodel';

export function GroupsCard() {
  const {
    template,
    groups,
    groupNamesInUse,
    canEdit,
    addGroupName,
    canAdd,
    onRemoveGroup,
    handleAddGroupNameChange,
    handleAddGroup,
  } = useGroupsCardViewModel();

  if (!template) return null;

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
            onChange={(e) => {
              handleAddGroupNameChange(e.target.value);
            }}
            onKeyDown={(e) => e.key === 'Enter' && handleAddGroup()}
          />
          <button
            type="button"
            className="btn-icon btn-add-icon"
            title="Add group"
            disabled={!canAdd}
            onClick={handleAddGroup}
          >
            <span className="material-symbols-outlined">add</span>
          </button>
        </div>
      )}
      <div className="tree-children">
        {groups.length === 0 && (
          <div className="empty-hint">No groups defined.</div>
        )}
        {[...groups].sort((a, b) => a.localeCompare(b)).map((name) => {
          const inUse = groupNamesInUse.has(name);
          return (
            <div key={name} className="variable-row">
              <span className="variable-name">{name}</span>
              {canEdit && (
                <button
                  type="button"
                  className="btn-icon btn-danger-icon"
                  title={inUse ? 'Cannot remove: group has mappings or variables' : 'Remove group'}
                  disabled={inUse}
                  onClick={() => onRemoveGroup(name)}
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
