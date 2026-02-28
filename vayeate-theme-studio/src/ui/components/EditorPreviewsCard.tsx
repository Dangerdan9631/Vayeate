import type { ColorAssignment } from '../../model/schemas';

interface EditorPreviewsCardProps {
  colorAssignments: readonly ColorAssignment[];
  colorVariableKeys: string[];
  idePrimaryColorRef: string | null;
  onChangeIdePrimaryColorRef: (ref: string | null) => void;
}

export function EditorPreviewsCard({
  colorAssignments,
  colorVariableKeys,
  idePrimaryColorRef,
  onChangeIdePrimaryColorRef,
}: EditorPreviewsCardProps) {
  const selectedAssignment = colorAssignments.find((a) => a.colorRef === idePrimaryColorRef);
  const darkBg = selectedAssignment?.dark?.value ?? '#1e1e1e';
  const lightBg = selectedAssignment
    ? (selectedAssignment.useDarkForLight
      ? (selectedAssignment.dark?.value ?? '#ffffff')
      : (selectedAssignment.light?.value ?? '#ffffff'))
    : '#ffffff';

  return (
    <div className="tokens-card placeholder theme-previews-card">
      <h2>Editor Previews</h2>

      <label className="field-row">
        <span className="field-label">IDE Primary Color Variable</span>
        <select
          className="field-select"
          value={idePrimaryColorRef ?? ''}
          onChange={(e) => onChangeIdePrimaryColorRef(e.target.value || null)}
        >
          <option value="">— select —</option>
          {colorVariableKeys.map((key) => (
            <option key={key} value={key}>
              {key}
            </option>
          ))}
        </select>
      </label>

      <div className="theme-preview-columns">
        <div className="theme-preview-col">
          <h3 className="theme-preview-heading">Dark</h3>
          <div className="theme-preview-bg" style={{ backgroundColor: darkBg }}>
            <textarea
              className="theme-preview-editor"
              readOnly
              placeholder="// Preview content will be loaded from examples on disk"
            />
          </div>
        </div>
        <div className="theme-preview-col">
          <h3 className="theme-preview-heading">Light</h3>
          <div className="theme-preview-bg" style={{ backgroundColor: lightBg }}>
            <textarea
              className="theme-preview-editor"
              readOnly
              placeholder="// Preview content will be loaded from examples on disk"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
