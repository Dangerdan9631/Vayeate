import { useEffect, useMemo, useState } from "react";
import type { GeneratedTheme, Theme, Template_v2, ThemeKind, VariableType } from "../domain/types";
import { PreviewPane } from "./preview/PreviewPane";
import { previewSamples } from "./preview/samples";

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
  const [selectedSampleIds, setSelectedSampleIds] = useState<string[]>(() => previewSamples.map((sample) => sample.id));
  const [showDark, setShowDark] = useState(true);
  const [showLight, setShowLight] = useState(true);
  const [previewBackgroundVariableId, setPreviewBackgroundVariableId] = useState("");
  const [previewContrastVariableId, setPreviewContrastVariableId] = useState("");

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

  useEffect(() => {
    const colorIds = template?.variables.color.map((variable) => variable.id) ?? [];
    const contrastIds = template?.variables.contrast.map((variable) => variable.id) ?? [];

    if (colorIds.length === 0) {
      setPreviewBackgroundVariableId("");
    } else if (!colorIds.includes(previewBackgroundVariableId)) {
      setPreviewBackgroundVariableId(colorIds[0]);
    }

    if (contrastIds.length === 0) {
      setPreviewContrastVariableId("");
    } else if (!contrastIds.includes(previewContrastVariableId)) {
      setPreviewContrastVariableId(contrastIds[0]);
    }
  }, [template, previewBackgroundVariableId, previewContrastVariableId]);

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

  const normalizeContrastInput = (value: string): string => {
    const trimmed = value.trim();
    if (!trimmed) return "";
    const parsed = Number.parseFloat(trimmed);
    if (!Number.isFinite(parsed)) return "";
    const bounded = Math.min(10, Math.max(1, parsed));
    return Number.parseFloat(bounded.toFixed(2)).toString();
  };

  const resolveVariableValue = (variableId: string, variant: "dark" | "light"): string => {
    if (!theme) return "";

    if (variant === "dark") {
      const darkAssignment = theme.values.dark.find((value) => value.variableId === variableId);
      if (!darkAssignment || darkAssignment.value === "useDark") return "";
      return darkAssignment.value;
    }

    const lightAssignment = theme.values.light.find((value) => value.variableId === variableId);
    if (!lightAssignment) return "";
    if (lightAssignment.value === "useDark") {
      const darkAssignment = theme.values.dark.find((value) => value.variableId === variableId);
      if (!darkAssignment || darkAssignment.value === "useDark") return "";
      return darkAssignment.value;
    }
    return lightAssignment.value;
  };

  const generatedThemes = useMemo(() => {
    if (!theme || !template) return null;

    const buildTheme = (kind: ThemeKind): GeneratedTheme => {
      const colors: Record<string, string> = {};
      const tokenColors: GeneratedTheme["tokenColors"] = [];
      const semanticTokenColors: Record<string, string> = {};

      for (const mapping of template.mappings) {
        const resolved = resolveVariableValue(mapping.variableId, kind);
        if (!resolved) {
          continue;
        }

        if (mapping.target === "colors") {
          colors[mapping.editorKey] = resolved;
        } else if (mapping.target === "semanticTokens") {
          semanticTokenColors[mapping.editorKey] = resolved;
        } else {
          tokenColors.push({
            scope: mapping.editorKey,
            settings: { foreground: resolved },
          });
        }
      }

      return {
        name: `${theme.name} (${kind})`,
        type: kind,
        semanticHighlighting: true,
        colors,
        tokenColors,
        semanticTokenColors,
      };
    };

    return {
      dark: buildTheme("dark"),
      light: buildTheme("light"),
    };
  }, [template, theme]);

  const selectedSamples = useMemo(
    () => previewSamples.filter((sample) => selectedSampleIds.includes(sample.id)),
    [selectedSampleIds],
  );

  const getPreviewFrameStyle = (variant: "dark" | "light") => {
    const frameBackground =
      (previewBackgroundVariableId ? resolveVariableValue(previewBackgroundVariableId, variant) : "")
      || (variant === "dark" ? "#1e1e1e" : "#f6f6f6");
    const frameContrast =
      (previewContrastVariableId ? resolveVariableValue(previewContrastVariableId, variant) : "")
      || (variant === "dark" ? "#d4d4d4" : "#202020");

    return {
      border: "1px solid #d0d0d0",
      borderRadius: 8,
      padding: 8,
      background: frameBackground,
      color: frameContrast,
    };
  };

  const toggleSample = (sampleId: string): void => {
    setSelectedSampleIds((prev) =>
      prev.includes(sampleId) ? prev.filter((id) => id !== sampleId) : [...prev, sampleId],
    );
  };

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 12, alignItems: "start" }}>
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
                                <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 8, alignItems: "center" }}>
                                  <label style={{ fontSize: 13 }}>Dark:</label>
                                  <input
                                    type="number"
                                    min={1}
                                    max={10}
                                    step={0.1}
                                    value={darkValue}
                                    onChange={(e) => onSetVariableValue(variable.id, "contrast", "dark", normalizeContrastInput(e.target.value))}
                                    placeholder="4.5"
                                    style={{ width: "100%" }}
                                  />
                                </div>
                                <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 8, alignItems: "center", marginTop: 6 }}>
                                  <label style={{ fontSize: 13 }}>Light:</label>
                                  {useDark ? (
                                    <div style={{ fontStyle: "italic", color: "#666" }}>Using dark value</div>
                                  ) : (
                                    <>
                                      <input
                                        type="number"
                                        min={1}
                                        max={10}
                                        step={0.1}
                                        value={lightValue}
                                        onChange={(e) => onSetVariableValue(variable.id, "contrast", "light", normalizeContrastInput(e.target.value))}
                                        placeholder="4.5"
                                        style={{ width: "100%" }}
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

        <article
          style={{
            border: "1px solid #d0d0d0",
            borderRadius: 8,
            padding: 12,
            display: "flex",
            flexDirection: "column",
            maxHeight: "calc(100dvh - 220px)",
          }}
        >
          <h2 style={{ margin: "0 0 10px", fontSize: 16 }}>Editor Previews</h2>

          {theme && template ? (
            <>
              <div style={{ display: "grid", gap: 10, marginBottom: 10 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <label style={{ display: "grid", gap: 4 }}>
                    <span style={{ fontSize: 12, fontWeight: 600 }}>Preview card background variable</span>
                    <select
                      value={previewBackgroundVariableId}
                      onChange={(e) => setPreviewBackgroundVariableId(e.target.value)}
                    >
                      <option value="">-- None --</option>
                      {(template?.variables.color ?? []).map((variable) => (
                        <option key={variable.id} value={variable.id}>
                          {variable.name} ({variable.id})
                        </option>
                      ))}
                    </select>
                  </label>

                  <label style={{ display: "grid", gap: 4 }}>
                    <span style={{ fontSize: 12, fontWeight: 600 }}>Preview card contrast variable</span>
                    <select
                      value={previewContrastVariableId}
                      onChange={(e) => setPreviewContrastVariableId(e.target.value)}
                    >
                      <option value="">-- None --</option>
                      {(template?.variables.contrast ?? []).map((variable) => (
                        <option key={variable.id} value={variable.id}>
                          {variable.name} ({variable.id})
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <label>
                    <input type="checkbox" checked={showDark} onChange={(event) => setShowDark(event.target.checked)} /> Dark
                  </label>
                  <label>
                    <input type="checkbox" checked={showLight} onChange={(event) => setShowLight(event.target.checked)} /> Light
                  </label>
                </div>

                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  {previewSamples.map((sample) => (
                    <label key={sample.id}>
                      <input
                        type="checkbox"
                        checked={selectedSampleIds.includes(sample.id)}
                        onChange={() => toggleSample(sample.id)}
                      />{" "}
                      {sample.label}
                    </label>
                  ))}
                </div>
              </div>

              <div style={{ flex: 1, minHeight: 0, overflow: "auto" }}>
                {!showDark && !showLight ? (
                  <p style={{ margin: 0, fontSize: 12 }}>Select at least one variant to render previews.</p>
                ) : (
                  <section style={{ display: "grid", gap: 10, gridTemplateColumns: showDark && showLight ? "1fr 1fr" : "1fr" }}>
                    {showDark && generatedThemes ? (
                      <div style={getPreviewFrameStyle("dark")}>
                        <PreviewPane title="Dark Preview" theme={generatedThemes.dark} samples={selectedSamples} />
                      </div>
                    ) : null}
                    {showLight && generatedThemes ? (
                      <div style={getPreviewFrameStyle("light")}>
                        <PreviewPane title="Light Preview" theme={generatedThemes.light} samples={selectedSamples} />
                      </div>
                    ) : null}
                  </section>
                )}
              </div>
            </>
          ) : (
            <p style={{ margin: 0, color: "inherit" }}>
              Select or create a theme to view editor previews.
            </p>
          )}
        </article>
      </div>
    </div>
  );
}
