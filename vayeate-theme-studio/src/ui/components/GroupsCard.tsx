import { useState } from 'react';
import { useAppDispatchV2 } from '../context/slice-contexts';

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
  const dispatchV2 = useAppDispatchV2();
  const [newName, setNewName] = useState('');

  const trimmed = newName.trim();
  const canAdd = trimmed.length > 0 && !groups.includes(trimmed);

  function handleAdd() {
    if (!canAdd) return;
    dispatchV2({ type: 'TEMPLATE_GROUP_ADD_BUTTON_ON_CLICK' });
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
            onChange={(e) => {
              const value = e.target.value;
              setNewName(value);
              dispatchV2({ type: 'TEMPLATE_GROUP_ADD_TEXT_ON_CHANGE', value });
            }}
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
                  onClick={() => {
                    dispatchV2({ type: 'TEMPLATE_GROUP_REMOVE_BUTTON_ON_CLICK', groupId: name });
                    onRemoveGroup(name);
                  }}
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
