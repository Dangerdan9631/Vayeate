import { useState } from "react";
import type { Theme, Template_v2, VariableType } from "../domain/types";

export interface ThemeTabV2Props {
  themes: string[];
  selectedThemeId: string | null;
  theme: Theme | null;
  template: Template_v2 | null;
  onSelectTheme: (id: string) => void;
  onCreateTheme: (name: string, templateId: string) => void;
  onSaveTheme: (theme: Theme) => Promise<void>;
  onUpdateThemeName: (name: string) => void;
  onSetVariableValue: (variableId: string, variableType: VariableType, variant: "dark" | "light", value: string) => void;
  onSetLightToUseDark: (variableId: string, variableType: VariableType) => void;
  onGenerateTheme: (themeId: string) => Promise<void>;
  onCloneTheme: (themeId: string, newName: string) => Promise<void>;
  templates: string[];
  busy: boolean;
  error: string;
}

export function ThemeTabV2({
  themes,
  selectedThemeId,
  theme,
  template,
  onSelectTheme,
  onCreateTheme,
  onSaveTheme,
  onUpdateThemeName,
  onSetVariableValue,
  onSetLightToUseDark,
  onGenerateTheme,
  onCloneTheme,
  templates,
  busy,
  error,
}: ThemeTabV2Props): JSX.Element {
  const [newThemeName, setNewThemeName] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [cloneName, setCloneName] = useState("");
  const [showCloneDialog, setShowCloneDialog] = useState(false);

  const handleCreateTheme = () => {
    if (newThemeName.trim() && selectedTemplateId) {
      onCreateTheme(newThemeName.trim(), selectedTemplateId);
      setNewThemeName("");
      setSelectedTemplateId("");
    }
  };

  const handleGenerate = () => {
    if (selectedThemeId) {
      void onGenerateTheme(selectedThemeId);
    }
  };

  const handleClone = () => {
    if (selectedThemeId && cloneName.trim()) {
      void onCloneTheme(selectedThemeId, cloneName.trim());
      setCloneName("");
      setShowCloneDialog(false);
    }
  };

  const allVariables = template
    ? [
        ...template.variables.color.map((v) => ({ ...v, type: "color" as const })),
        ...template.variables.contrast.map((v) => ({ ...v, type: "contrast" as const })),
      ]
    : [];

  const isLightUsingDark = (variableId: string, variableType: VariableType): boolean => {
    if (!theme) return false;
    const assignment = theme.values.light.find((v) => v.variableId === variableId);
    return assignment?.value === "useDark";
  };

  const getVariableValue = (variableId: string, variableType: VariableType, variant: "dark" | "light"): string => {
    if (!theme) return "";
    const variantArray = variant === "dark" ? theme.values.dark : theme.values.light;
    const assignment = variantArray.find((v) => v.variableId === variableId);
    
    if (!assignment) return "";
    
    if (variant === "light" && assignment.value === "useDark") {
      const darkAssignment = theme.values.dark.find((v) => v.variableId === variableId);
      return darkAssignment?.value || "";
    }
    
    return assignment.value;
  };

  return (
    <div style={{ display: "grid", gap: 12 }}>
      {/* Theme Selection */}
      <article style={{ border: "1px solid #d0d0d0", borderRadius: 8, padding: 12 }}>
        <h2 style={{ margin: "0 0 10px", fontSize: 16 }}>Themes</h2>
        <div style={{ display: "grid", gap: 8 }}>
          <label>
            Select Theme
            <select
              value={selectedThemeId || ""}
              onChange={(e) => onSelectTheme(e.target.value)}
              style={{ width: "100%" }}
            >
              <option value="">-- Select Theme --</option>
              {themes.map((id) => (
                <option key={id} value={id}>
                  {id}
                </option>
              ))}
            </select>
          </label>

          {/* Create New Theme */}
          <div style={{ borderTop: "1px solid #e1e1e1", paddingTop: 8, marginTop: 4 }}>
            <h3 style={{ margin: "0 0 8px", fontSize: 14 }}>Create New Theme</h3>
            <div style={{ display: "grid", gap: 6 }}>
              <input
                placeholder="Theme name"
                value={newThemeName}
                onChange={(e) => setNewThemeName(e.target.value)}
                style={{ width: "100%" }}
              />
              <select
                value={selectedTemplateId}
                onChange={(e) => setSelectedTemplateId(e.target.value)}
                style={{ width: "100%" }}
              >
                <option value="">-- Select Template --</option>
                {templates.map((id) => (
                  <option key={id} value={id}>
                    {id}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleCreateTheme}
                disabled={!newThemeName.trim() || !selectedTemplateId || busy}
              >
                Create Theme
              </button>
            </div>
          </div>

          {theme && (
            <div style={{ display: "flex", gap: 8 }}>
              <button type="button" onClick={() => void onSaveTheme(theme)} disabled={busy}>
                Save Theme
              </button>
              <button type="button" onClick={handleGenerate} disabled={busy}>
                Generate VS Code Themes
              </button>
              <button type="button" onClick={() => setShowCloneDialog(true)} disabled={busy}>
                Clone Theme
              </button>
            </div>
          )}
        </div>
      </article>

      {showCloneDialog && (
        <article style={{ border: "2px solid #0066cc", borderRadius: 8, padding: 12, background: "#f0f8ff" }}>
          <h3 style={{ margin: "0 0 10px", fontSize: 14 }}>Clone Theme</h3>
          <div style={{ display: "grid", gap: 6 }}>
            <input
              placeholder="New theme name"
              value={cloneName}
              onChange={(e) => setCloneName(e.target.value)}
              style={{ width: "100%" }}
            />
            <div style={{ display: "flex", gap: 8 }}>
              <button type="button" onClick={handleClone} disabled={!cloneName.trim() || busy}>
                Clone
              </button>
              <button type="button" onClick={() => setShowCloneDialog(false)}>
                Cancel
              </button>
            </div>
          </div>
        </article>
      )}

      {theme && template ? (
        <>
          {/* Theme Info */}
          <article style={{ border: "1px solid #d0d0d0", borderRadius: 8, padding: 12 }}>
            <h2 style={{ margin: "0 0 10px", fontSize: 16 }}>Theme: {theme.name}</h2>
            <div style={{ display: "grid", gap: 8 }}>
              <label>
                Name
                <input
                  value={theme.name}
                  onChange={(e) => onUpdateThemeName(e.target.value)}
                  style={{ width: "100%" }}
                />
              </label>
              <div>
                <strong>Template:</strong> {theme.templateRef}
              </div>
              <div>
                <strong>Variables:</strong> {allVariables.length} total
              </div>
            </div>
          </article>

          {/* Variable Values */}
          <article style={{ border: "1px solid #d0d0d0", borderRadius: 8, padding: 12 }}>
            <h2 style={{ margin: "0 0 10px", fontSize: 16 }}>Variable Values</h2>
            
            {allVariables.length === 0 ? (
              <p style={{ margin: 0, color: "#666" }}>No variables defined in template.</p>
            ) : (
              <div style={{ display: "grid", gap: 12 }}>
                {/* Color Variables */}
                {template.variables.color.length > 0 && (
                  <div>
                    <h3 style={{ margin: "0 0 8px", fontSize: 14 }}>Color Variables</h3>
                    <div style={{ display: "grid", gap: 6 }}>
                      {template.variables.color.map((variable) => {
                        const useDark = isLightUsingDark(variable.id, "color");
                        const darkValue = getVariableValue(variable.id, "color", "dark");
                        const lightValue = useDark ? darkValue : getVariableValue(variable.id, "color", "light");
                        
                        return (
                          <div key={variable.id} style={{ border: "1px solid #e1e1e1", borderRadius: 4, padding: 10 }}>
                            <div style={{ fontWeight: 600, marginBottom: 6 }}>
                              {variable.name} <span style={{ fontSize: 11, color: "#666" }}>({variable.id})</span>
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 8, alignItems: "center" }}>
                              {/* Dark Value */}
                              <label style={{ fontSize: 13 }}>Dark:</label>
                              <input
                                type="text"
                                value={darkValue}
                                onChange={(e) => onSetVariableValue(variable.id, "color", "dark", e.target.value)}
                                placeholder="#rrggbb"
                                style={{ width: "100%" }}
                              />
                              <input
                                type="color"
                                value={darkValue.startsWith("#") && darkValue.length === 7 ? darkValue : "#000000"}
                                onChange={(e) => onSetVariableValue(variable.id, "color", "dark", e.target.value)}
                                style={{ width: 40, height: 30, cursor: "pointer" }}
                              />
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 8, alignItems: "center", marginTop: 6 }}>
                              {/* Light Value */}
                              <label style={{ fontSize: 13 }}>Light:</label>
                              {useDark ? (
                                <div style={{ fontStyle: "italic", color: "#666" }}>Using dark value</div>
                              ) : (
                                <>
                                  <input
                                    type="text"
                                    value={lightValue}
                                    onChange={(e) => onSetVariableValue(variable.id, "color", "light", e.target.value)}
                                    placeholder="#rrggbb"
                                    style={{ width: "100%" }}
                                  />
                                  <input
                                    type="color"
                                    value={lightValue.startsWith("#") && lightValue.length === 7 ? lightValue : "#ffffff"}
                                    onChange={(e) => onSetVariableValue(variable.id, "color", "light", e.target.value)}
                                    style={{ width: 40, height: 30, cursor: "pointer" }}
                                  />
                                </>
                              )}
                            </div>
                            <div style={{ marginTop: 6 }}>
                              <label style={{ fontSize: 12 }}>
                                <input
                                  type="checkbox"
                                  checked={useDark}
                                  onChange={() => onSetLightToUseDark(variable.id, "color")}
                                />{" "}
                                Light uses dark value
                              </label>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Contrast Variables */}
                {template.variables.contrast.length > 0 && (
                  <div>
                    <h3 style={{ margin: "0 0 8px", fontSize: 14 }}>Contrast Variables</h3>
                    <div style={{ display: "grid", gap: 6 }}>
                      {template.variables.contrast.map((variable) => {
                        const useDark = isLightUsingDark(variable.id, "contrast");
                        const darkValue = getVariableValue(variable.id, "contrast", "dark");
                        const lightValue = useDark ? darkValue : getVariableValue(variable.id, "contrast", "light");
                        
                        return (
                          <div key={variable.id} style={{ border: "1px solid #e1e1e1", borderRadius: 4, padding: 10 }}>
                            <div style={{ fontWeight: 600, marginBottom: 6 }}>
                              {variable.name} <span style={{ fontSize: 11, color: "#666" }}>({variable.id}, ratio: {variable.targetRatio})</span>
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 8, alignItems: "center" }}>
                              {/* Dark Value */}
                              <label style={{ fontSize: 13 }}>Dark:</label>
                              <input
                                type="text"
                                value={darkValue}
                                onChange={(e) => onSetVariableValue(variable.id, "contrast", "dark", e.target.value)}
                                placeholder="#rrggbb"
                                style={{ width: "100%" }}
                              />
                              <input
                                type="color"
                                value={darkValue.startsWith("#") && darkValue.length === 7 ? darkValue : "#000000"}
                                onChange={(e) => onSetVariableValue(variable.id, "contrast", "dark", e.target.value)}
                                style={{ width: 40, height: 30, cursor: "pointer" }}
                              />
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 8, alignItems: "center", marginTop: 6 }}>
                              {/* Light Value */}
                              <label style={{ fontSize: 13 }}>Light:</label>
                              {useDark ? (
                                <div style={{ fontStyle: "italic", color: "#666" }}>Using dark value</div>
                              ) : (
                                <>
                                  <input
                                    type="text"
                                    value={lightValue}
                                    onChange={(e) => onSetVariableValue(variable.id, "contrast", "light", e.target.value)}
                                    placeholder="#rrggbb"
                                    style={{ width: "100%" }}
                                  />
                                  <input
                                    type="color"
                                    value={lightValue.startsWith("#") && lightValue.length === 7 ? lightValue : "#ffffff"}
                                    onChange={(e) => onSetVariableValue(variable.id, "contrast", "light", e.target.value)}
                                    style={{ width: 40, height: 30, cursor: "pointer" }}
                                  />
                                </>
                              )}
                            </div>
                            <div style={{ marginTop: 6 }}>
                              <label style={{ fontSize: 12 }}>
                                <input
                                  type="checkbox"
                                  checked={useDark}
                                  onChange={() => onSetLightToUseDark(variable.id, "contrast")}
                                />{" "}
                                Light uses dark value
                              </label>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </article>
        </>
      ) : (
        <article style={{ border: "1px solid #d0d0d0", borderRadius: 8, padding: 12 }}>
          <p style={{ margin: 0, color: "#666" }}>Select or create a theme to edit variable values and generate VS Code themes.</p>
        </article>
      )}

      {error && (
        <div style={{ padding: 12, background: "#ffeef2", border: "1px solid #b00020", borderRadius: 6, color: "#b00020" }}>
          {error}
        </div>
      )}
    </div>
  );
}
