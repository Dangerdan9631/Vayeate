import { useState } from 'react';

interface GroupsCardProps {
  groups: readonly string[];
  groupNamesInUse: Set<string>;
  canEdit: boolean;
  onAddGroup: (name: string) => void;
  onRemoveGroup: (name: string) => void;
}

export function GroupsCard({
  groups,
  groupNamesInUse,
  canEdit,
  onAddGroup,
  onRemoveGroup,
}: GroupsCardProps) {
  const [newName, setNewName] = useState('');

  const trimmed = newName.trim();
  const canAdd = trimmed.length > 0 && !groups.includes(trimmed);

  function handleAdd() {
    if (!canAdd) return;
    onAddGroup(trimmed);
    setNewName('');
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
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          />
          <button
            type="button"
            className="btn-icon btn-add-icon"
            title="Add group"
            disabled={!canAdd}
            onClick={handleAdd}
          >
            <span className="material-symbols-outlined">add</span>
          </button>
        </div>
      )}
      <div className="tree-children">
        {groups.length === 0 && (
          <div className="empty-hint">No groups defined.</div>
        )}
        {groups.map((name) => {
          const inUse = groupNamesInUse.has(name);
          return (
            <div key={name} className="variable-row">
              <span className="variable-name">{name}</span>
              {canEdit && (
                <button
                  type="button"
                  className="btn-icon btn-danger-icon"
                  title={inUse ? 'Cannot remove: group has mappings' : 'Remove group'}
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
