import type { ColorVariable, ElementBinding, ThemeTemplate } from "../domain/types";

const CATEGORY_OPTIONS: Array<ElementBinding["category"]> = ["default", "keyword", "string", "comment"];

export interface TemplateTabProps {
  template: ThemeTemplate;
  templateFileName: string;
  templateError: string;
  workspaceTemplates: string[];
  apiBusy: boolean;
  apiMessage: string;
  apiError: string;
  fileInputRef: React.RefObject<HTMLInputElement>;
  updateTemplateMeta: (field: "name" | "description", value: string) => void;
  downloadTemplate: () => void;
  handleImportTemplate: (file: File) => void;
  handleResetDefault: () => void;
  setTemplateFileName: (fileName: string) => void;
  handleSaveWorkspaceTemplate: () => Promise<void>;
  refreshWorkspaceTemplates: () => Promise<void>;
  handleLoadWorkspaceTemplate: () => Promise<void>;
  updateVariable: (variableId: string, field: "label" | "value", value: string) => void;
  updateBinding: (index: number, field: keyof ElementBinding, value: string) => void;
  addBinding: () => void;
  removeBinding: (index: number) => void;
}

export function TemplateTab({
  template,
  templateFileName,
  templateError,
  workspaceTemplates,
  apiBusy,
  apiMessage,
  apiError,
  fileInputRef,
  updateTemplateMeta,
  downloadTemplate,
  handleImportTemplate,
  handleResetDefault,
  setTemplateFileName,
  handleSaveWorkspaceTemplate,
  refreshWorkspaceTemplates,
  handleLoadWorkspaceTemplate,
  updateVariable,
  updateBinding,
  addBinding,
  removeBinding,
}: TemplateTabProps): JSX.Element {
  const variableEntries = Object.entries(template.variables);

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <article style={{ border: "1px solid #d0d0d0", borderRadius: 8, padding: 12 }}>
        <h2 style={{ margin: "0 0 10px", fontSize: 16 }}>Template Metadata</h2>
        <div style={{ display: "grid", gap: 8 }}>
          <label>
            Name
            <input
              value={template.name}
              onChange={(event) => updateTemplateMeta("name", event.target.value)}
              style={{ width: "100%" }}
            />
          </label>
          <label>
            Description
            <input
              value={template.description ?? ""}
              onChange={(event) => updateTemplateMeta("description", event.target.value)}
              style={{ width: "100%" }}
            />
          </label>
        </div>
      </article>

      <article style={{ border: "1px solid #d0d0d0", borderRadius: 8, padding: 12 }}>
        <h2 style={{ margin: "0 0 10px", fontSize: 16 }}>Template File Management</h2>
        <div style={{ display: "grid", gap: 8 }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button type="button" onClick={downloadTemplate}>
              Export Template JSON
            </button>
            <button type="button" onClick={() => fileInputRef.current?.click()}>
              Import Template JSON
            </button>
            <button type="button" onClick={handleResetDefault}>
              Reset Default
            </button>
          </div>
          <label>
            Workspace file
            <input
              value={templateFileName}
              onChange={(event) => setTemplateFileName(event.target.value)}
              style={{ width: "100%" }}
            />
          </label>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button type="button" onClick={() => void handleSaveWorkspaceTemplate()} disabled={apiBusy}>
              Save to Workspace
            </button>
            <button type="button" onClick={() => void refreshWorkspaceTemplates()} disabled={apiBusy}>
              Refresh Workspace List
            </button>
            <button type="button" onClick={() => void handleLoadWorkspaceTemplate()} disabled={apiBusy}>
              Load Selected
            </button>
          </div>
          <label>
            Workspace templates
            <select
              value={templateFileName}
              onChange={(event) => setTemplateFileName(event.target.value)}
              style={{ width: "100%" }}
            >
              <option value="">-- select --</option>
              {workspaceTemplates.map((fileName) => (
                <option key={fileName} value={fileName}>
                  {fileName}
                </option>
              ))}
            </select>
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            style={{ display: "none" }}
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) handleImportTemplate(file);
              event.currentTarget.value = "";
            }}
          />
          {templateError ? <p style={{ margin: 0, color: "#b00020" }}>{templateError}</p> : null}
          {apiError ? <p style={{ margin: 0, color: "#b00020", whiteSpace: "pre-wrap" }}>{apiError}</p> : null}
          {apiMessage ? <p style={{ margin: 0, color: "#0b5f2a", whiteSpace: "pre-wrap" }}>{apiMessage}</p> : null}
          <p style={{ margin: 0, fontSize: 12, color: "#444" }}>
            Workspace template files belong in <strong>color-theme-editor/templates</strong>.
          </p>
        </div>
      </article>

      <article style={{ border: "1px solid #d0d0d0", borderRadius: 8, padding: 12 }}>
        <h2 style={{ margin: "0 0 10px", fontSize: 16 }}>Variables</h2>
        <div style={{ display: "grid", gap: 8 }}>
          {variableEntries.map(([id, variable]) => (
            <div
              key={id}
              style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: 6, alignItems: "center" }}
            >
              <label>
                <span style={{ display: "block", fontSize: 12 }}>{variable.label}</span>
                <input
                  value={variable.value}
                  onChange={(event) => updateVariable(id, "value", event.target.value)}
                  style={{ width: "100%" }}
                />
              </label>
              <input
                type="color"
                value={variable.value}
                onChange={(event) => updateVariable(id, "value", event.target.value)}
                title={variable.label}
              />
              <span style={{ fontSize: 12, color: "#666" }}>{variable.role ?? "-"}</span>
            </div>
          ))}
        </div>
      </article>

      <article style={{ border: "1px solid #d0d0d0", borderRadius: 8, padding: 12 }}>
        <h2 style={{ margin: "0 0 10px", fontSize: 16 }}>Bindings</h2>
        <div style={{ display: "grid", gap: 8 }}>
          {template.bindings.map((binding, index) => (
            <div key={`${binding.key}-${index}`} style={{ border: "1px solid #e1e1e1", borderRadius: 6, padding: 8 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                <label>
                  Target
                  <select
                    value={binding.target}
                    onChange={(event) => updateBinding(index, "target", event.target.value)}
                    style={{ width: "100%" }}
                  >
                    <option value="colors">colors</option>
                    <option value="tokenColors">tokenColors</option>
                    <option value="semanticTokenColors">semanticTokenColors</option>
                  </select>
                </label>
                <label>
                  Strategy
                  <select
                    value={binding.strategy}
                    onChange={(event) => updateBinding(index, "strategy", event.target.value)}
                    style={{ width: "100%" }}
                  >
                    <option value="raw">raw</option>
                    <option value="deriveContrast">deriveContrast</option>
                    <option value="copyFromDark">copyFromDark</option>
                  </select>
                </label>
                <label>
                  Key
                  <input
                    value={binding.key}
                    onChange={(event) => updateBinding(index, "key", event.target.value)}
                    style={{ width: "100%" }}
                  />
                </label>
                <label>
                  Variable
                  <select
                    value={binding.variableId ?? ""}
                    onChange={(event) => updateBinding(index, "variableId", event.target.value)}
                    style={{ width: "100%" }}
                  >
                    {variableEntries.map(([id, variable]) => (
                      <option key={id} value={id}>
                        {id}: {variable.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Category
                  <select
                    value={binding.category ?? "default"}
                    onChange={(event) => updateBinding(index, "category", event.target.value)}
                    style={{ width: "100%" }}
                  >
                    {CATEGORY_OPTIONS.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <button type="button" onClick={() => removeBinding(index)} style={{ marginTop: 8 }}>
                Remove
              </button>
            </div>
          ))}
          <button type="button" onClick={addBinding}>
            Add Binding
          </button>
        </div>
      </article>
    </div>
  );
}
