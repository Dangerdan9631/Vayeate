import { useEffect, useMemo, useState } from "react";
import type { GeneratedTheme, PreviewSourceLanguage, PreviewTokenizedLanguageBatch, PreviewTokenizedSample, Theme, Template_v2, ThemeKind, VariableType } from "../domain/types";
import { PreviewPane } from "./preview/PreviewPane";
import { fetchPreviewTokens, listPreviewSources } from "./api/themeStudioApi-v2";

export function getAlwaysOnPreviewVariants(): ThemeKind[] {
  return ["dark", "light"];
}

export function flattenTokenizedPreviewSamples(
  languages: PreviewSourceLanguage[],
  batches: PreviewTokenizedLanguageBatch[],
): PreviewTokenizedSample[] {
  const byLanguage = new Map(batches.map((batch) => [batch.languageId, batch.samples]));
  const samples: PreviewTokenizedSample[] = [];
  for (const language of languages) {
    const languageSamples = byLanguage.get(language.id) ?? [];
    for (const sample of language.samples) {
      const tokenized = languageSamples.find((entry) => entry.sampleId === sample.id);
      if (tokenized) {
        samples.push(tokenized);
      }
    }
  }
  return samples;
}

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
  const [previewBorderVariableId, setPreviewBorderVariableId] = useState("");
  const [variableSearch, setVariableSearch] = useState("");
  const [previewLanguages, setPreviewLanguages] = useState<PreviewSourceLanguage[]>([]);
  const [previewBatches, setPreviewBatches] = useState<PreviewTokenizedLanguageBatch[]>([]);
  const [previewBusy, setPreviewBusy] = useState(false);
  const [previewError, setPreviewError] = useState("");

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
    const persisted = theme?.preview?.borderVariableId ?? "";

    if (colorIds.length === 0) {
      setPreviewBorderVariableId("");
      return;
    }

    if (persisted && colorIds.includes(persisted)) {
      setPreviewBorderVariableId(persisted);
      return;
    }

    setPreviewBorderVariableId((current) => (colorIds.includes(current) ? current : colorIds[0]));
  }, [template, theme?.id, theme?.preview?.borderVariableId]);

  useEffect(() => {
    let active = true;

    async function hydratePreviewSources(): Promise<void> {
      setPreviewBusy(true);
      setPreviewError("");
      try {
        const languages = await listPreviewSources();
        if (!active) return;
        setPreviewLanguages(languages);

        const sampleIdsByLanguage = Object.fromEntries(
          languages.map((language) => [language.id, language.samples.map((sample) => sample.id)]),
        ) as Record<string, string[]>;

        const batches = await fetchPreviewTokens({
          languageIds: languages.map((language) => language.id),
          sampleIdsByLanguage,
        });
        if (!active) return;
        setPreviewBatches(batches);
      } catch (error) {
        if (!active) return;
        const message = error instanceof Error ? error.message : "Failed to load preview samples";
        setPreviewError(message);
      } finally {
        if (!active) return;
        setPreviewBusy(false);
      }
    }

    void hydratePreviewSources();
    return () => {
      active = false;
    };
  }, []);

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

    const resolveFirstColorValue = (kind: ThemeKind, candidateIds: string[]): string => {
      for (const candidateId of candidateIds) {
        const resolved = resolveVariableValue(candidateId, kind);
        if (/^#[0-9a-fA-F]{6}$/.test(resolved)) {
          return resolved;
        }
      }
      return "";
    };

    const resolveByPrefix = (kind: ThemeKind, prefixes: string[]): string => {
      for (const variable of template.variables.color) {
        const lowered = variable.id.toLowerCase();
        if (!prefixes.some((prefix) => lowered.startsWith(prefix))) {
          continue;
        }
        const resolved = resolveVariableValue(variable.id, kind);
        if (/^#[0-9a-fA-F]{6}$/.test(resolved)) {
          return resolved;
        }
      }
      return "";
    };

    const buildTheme = (kind: ThemeKind): GeneratedTheme => {
      const colors: Record<string, string> = {};
      const tokenColors: GeneratedTheme["tokenColors"] = [];
      const semanticTokenColors: Record<string, string> = {};

      for (const mapping of template.mappings) {
        const resolved = resolveVariableValue(mapping.variableId, kind);
        if (!/^#[0-9a-fA-F]{6}$/.test(resolved)) {
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

      const fallbackEditorBackground =
        resolveFirstColorValue(kind, ["editor-background", "panel-background", "ide-primary"]) ||
        (kind === "dark" ? "#1e1e1e" : "#f6f6f6");
      const fallbackEditorForeground =
        resolveFirstColorValue(kind, ["editor-foreground", "editor-ui", "list-foreground"]) ||
        (kind === "dark" ? "#d4d4d4" : "#202020");

      colors["editor.background"] = colors["editor.background"] ?? fallbackEditorBackground;
      colors["editor.foreground"] = colors["editor.foreground"] ?? fallbackEditorForeground;

      const keywordColor =
        resolveFirstColorValue(kind, ["keywords", "operators", "constants"]) ||
        resolveByPrefix(kind, ["keyword", "operator", "constant"]);
      const commentColor =
        resolveFirstColorValue(kind, ["comments", "doc-comments"]) ||
        resolveByPrefix(kind, ["comment", "doc-comment"]);
      const stringColor =
        resolveFirstColorValue(kind, ["strings", "config-syntax"]) ||
        resolveByPrefix(kind, ["string"]);

      if (keywordColor && !semanticTokenColors.keyword) {
        semanticTokenColors.keyword = keywordColor;
      }
      if (commentColor && !semanticTokenColors.comment) {
        semanticTokenColors.comment = commentColor;
      }
      if (stringColor && !semanticTokenColors.string) {
        semanticTokenColors.string = stringColor;
      }

      if (keywordColor) {
        tokenColors.push({
          scope: ["keyword", "storage", "support.function"],
          settings: { foreground: keywordColor },
        });
      }
      if (commentColor) {
        tokenColors.push({
          scope: ["comment", "punctuation.definition.comment"],
          settings: { foreground: commentColor },
        });
      }
      if (stringColor) {
        tokenColors.push({
          scope: ["string", "punctuation.definition.string"],
          settings: { foreground: stringColor },
        });
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
    () => flattenTokenizedPreviewSamples(previewLanguages, previewBatches),
    [previewBatches, previewLanguages],
  );

  const themeWithPreview = useMemo(() => {
    if (!theme) return null;
    return {
      ...theme,
      preview: previewBorderVariableId ? { borderVariableId: previewBorderVariableId } : undefined,
    } satisfies Theme;
  }, [previewBorderVariableId, theme]);

  const autosaveTheme = (nextPreviewVariableId: string | null = null): void => {
    if (!theme) return;

    const previewVariableId = nextPreviewVariableId === null
      ? previewBorderVariableId
      : nextPreviewVariableId;

    const nextTheme: Theme = {
      ...theme,
      preview: previewVariableId ? { borderVariableId: previewVariableId } : undefined,
    };

    void onSaveTheme(nextTheme);
  };

  const filteredColorVariables = useMemo(() => {
    const query = variableSearch.trim().toLowerCase();
    if (!query) return template?.variables.color ?? [];
    return (template?.variables.color ?? []).filter((variable) =>
      variable.name.toLowerCase().includes(query)
      || variable.id.toLowerCase().includes(query),
    );
  }, [template?.variables.color, variableSearch]);

  const filteredContrastVariables = useMemo(() => {
    const query = variableSearch.trim().toLowerCase();
    if (!query) return template?.variables.contrast ?? [];
    return (template?.variables.contrast ?? []).filter((variable) =>
      variable.name.toLowerCase().includes(query)
      || variable.id.toLowerCase().includes(query),
    );
  }, [template?.variables.contrast, variableSearch]);

  const getPreviewFrameStyle = (variant: "dark" | "light") => {
    const frameBorder =
      (previewBorderVariableId ? resolveVariableValue(previewBorderVariableId, variant) : "")
      || (variant === "dark" ? "#4f4f4f" : "#c5c5c5");

    return {
      border: `1px solid ${frameBorder}`,
      backgroundColor: frameBorder,
      borderRadius: 8,
      padding: 8,
    };
  };

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 12, alignItems: "start", maxHeight: "calc(100dvh - 160px)" }}>
        <div style={{ display: "grid", gap: 12, overflow: "auto", minHeight: 0 }}>
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
                  <button type="button" onClick={() => themeWithPreview && void onSaveTheme(themeWithPreview)} disabled={busy || !themeWithPreview}>
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
              <article style={{ border: "1px solid #d0d0d0", borderRadius: 8, padding: 8 }}>
                <h2 style={{ margin: "0 0 4px", fontSize: 14, lineHeight: 1.1 }}>Variable Values</h2>
                <div style={{ marginBottom: 4 }}>
                  <input
                    type="search"
                    value={variableSearch}
                    onChange={(e) => setVariableSearch(e.target.value)}
                    placeholder="Search variables"
                    style={{ width: "100%", fontSize: 10, padding: "2px 4px", lineHeight: 1.1 }}
                  />
                </div>

                {allVariables.length === 0 ? (
                  <p style={{ margin: 0, color: "#666" }}>No variables defined in template.</p>
                ) : (
                  <div style={{ display: "grid", gap: 4 }}>
                    {/* Color Variables */}
                    {filteredColorVariables.length > 0 && (
                      <div>
                        <h3 style={{ margin: "0 0 2px", fontSize: 11, lineHeight: 1.1 }}>Color Variables</h3>
                        <div style={{ display: "grid", gap: 2 }}>
                          {filteredColorVariables.map((variable) => {
                            const useDark = isLightUsingDark(variable.id, "color");
                            const darkValue = getVariableValue(variable.id, "color", "dark");
                            const lightValue = useDark ? darkValue : getVariableValue(variable.id, "color", "light");

                            return (
                              <div key={variable.id} style={{ border: "1px solid #e1e1e1", borderRadius: 3, padding: 4, width: "100%", boxSizing: "border-box" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 4, marginBottom: 2 }}>
                                  <div style={{ fontWeight: 600, fontSize: 11, minWidth: 0, overflowWrap: "anywhere", lineHeight: 1.1 }}>
                                    {variable.name} <span style={{ fontSize: 9, color: "#666" }}>({variable.id})</span>
                                  </div>
                                  <label style={{ fontSize: 10, lineHeight: 1.1, flexShrink: 1 }}>
                                    <input
                                      type="checkbox"
                                      checked={useDark}
                                      onChange={() => {
                                        onSetLightToUseDark(variable.id, "color");
                                        autosaveTheme();
                                      }}
                                    />{" "}
                                    Light uses dark value
                                  </label>
                                </div>
                                <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)", gap: 4 }}>
                                  <div style={{ display: "grid", gridTemplateColumns: "auto minmax(0, 1fr) auto", gap: 4, alignItems: "center", minWidth: 0 }}>
                                    <label style={{ fontSize: 10, lineHeight: 1.1 }}>Dark:</label>
                                    <input
                                      type="text"
                                      value={darkValue}
                                      onChange={(e) => onSetVariableValue(variable.id, "color", "dark", e.target.value)}
                                      onBlur={() => autosaveTheme()}
                                      placeholder="#rrggbb"
                                      style={{ width: "100%", minWidth: 0, fontSize: 10, padding: "1px 3px", lineHeight: 1.1 }}
                                    />
                                    <input
                                      type="color"
                                      value={darkValue.startsWith("#") && darkValue.length === 7 ? darkValue : "#000000"}
                                      onChange={(e) => onSetVariableValue(variable.id, "color", "dark", e.target.value)}
                                      onBlur={() => autosaveTheme()}
                                      style={{ width: 24, height: 18, cursor: "pointer", padding: 0 }}
                                    />
                                  </div>
                                  <div style={{ display: "grid", gridTemplateColumns: "auto minmax(0, 1fr) auto", gap: 4, alignItems: "center", minWidth: 0 }}>
                                    <label style={{ fontSize: 10, lineHeight: 1.1 }}>Light:</label>
                                    {useDark ? (
                                      <div style={{ gridColumn: "2 / span 2", fontStyle: "italic", fontSize: 10, color: "#666", lineHeight: 1.1 }}>Using dark value</div>
                                    ) : (
                                      <>
                                      <input
                                        type="text"
                                        value={lightValue}
                                        onChange={(e) => onSetVariableValue(variable.id, "color", "light", e.target.value)}
                                        onBlur={() => autosaveTheme()}
                                        placeholder="#rrggbb"
                                        style={{ width: "100%", minWidth: 0, fontSize: 10, padding: "1px 3px", lineHeight: 1.1 }}
                                      />
                                      <input
                                        type="color"
                                        value={lightValue.startsWith("#") && lightValue.length === 7 ? lightValue : "#ffffff"}
                                        onChange={(e) => onSetVariableValue(variable.id, "color", "light", e.target.value)}
                                        onBlur={() => autosaveTheme()}
                                        style={{ width: 24, height: 18, cursor: "pointer", padding: 0 }}
                                      />
                                    </>
                                  )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Contrast Variables */}
                    {filteredContrastVariables.length > 0 && (
                      <div>
                        <h3 style={{ margin: "0 0 2px", fontSize: 11, lineHeight: 1.1 }}>Contrast Variables</h3>
                        <div style={{ display: "grid", gap: 2 }}>
                          {filteredContrastVariables.map((variable) => {
                            const useDark = isLightUsingDark(variable.id, "contrast");
                            const darkValue = getVariableValue(variable.id, "contrast", "dark");
                            const lightValue = useDark ? darkValue : getVariableValue(variable.id, "contrast", "light");

                            return (
                              <div key={variable.id} style={{ border: "1px solid #e1e1e1", borderRadius: 3, padding: 4, width: "100%", boxSizing: "border-box" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 4, marginBottom: 2 }}>
                                  <div style={{ fontWeight: 600, fontSize: 11, minWidth: 0, overflowWrap: "anywhere", lineHeight: 1.1 }}>
                                    {variable.name} <span style={{ fontSize: 9, color: "#666" }}>({variable.id}, ratio: {variable.targetRatio})</span>
                                  </div>
                                  <label style={{ fontSize: 10, lineHeight: 1.1, flexShrink: 1 }}>
                                    <input
                                      type="checkbox"
                                      checked={useDark}
                                      onChange={() => {
                                        onSetLightToUseDark(variable.id, "contrast");
                                        autosaveTheme();
                                      }}
                                    />{" "}
                                    Light uses dark value
                                  </label>
                                </div>
                                <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)", gap: 4 }}>
                                  <div style={{ display: "grid", gridTemplateColumns: "auto auto", gap: 4, alignItems: "center", justifyContent: "start", minWidth: 0 }}>
                                    <label style={{ fontSize: 10, lineHeight: 1.1 }}>Dark:</label>
                                    <input
                                      type="number"
                                      min={1}
                                      max={10}
                                      step={0.1}
                                      value={darkValue}
                                      onChange={(e) => onSetVariableValue(variable.id, "contrast", "dark", normalizeContrastInput(e.target.value))}
                                      onBlur={() => autosaveTheme()}
                                      placeholder="4.5"
                                      style={{ width: 56, minWidth: 0, fontSize: 10, padding: "1px 3px", lineHeight: 1.1 }}
                                    />
                                  </div>
                                  <div style={{ display: "grid", gridTemplateColumns: "auto auto", gap: 4, alignItems: "center", justifyContent: "start", minWidth: 0 }}>
                                    <label style={{ fontSize: 10, lineHeight: 1.1 }}>Light:</label>
                                    {useDark ? (
                                      <div style={{ fontStyle: "italic", fontSize: 10, color: "#666", lineHeight: 1.1 }}>Using dark value</div>
                                    ) : (
                                      <>
                                      <input
                                        type="number"
                                        min={1}
                                        max={10}
                                        step={0.1}
                                        value={lightValue}
                                        onChange={(e) => onSetVariableValue(variable.id, "contrast", "light", normalizeContrastInput(e.target.value))}
                                        onBlur={() => autosaveTheme()}
                                        placeholder="4.5"
                                        style={{ width: 56, minWidth: 0, fontSize: 10, padding: "1px 3px", lineHeight: 1.1 }}
                                      />
                                    </>
                                  )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {filteredColorVariables.length === 0 && filteredContrastVariables.length === 0 ? (
                      <p style={{ margin: 0, color: "#666" }}>No variables match your search.</p>
                    ) : null}
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
            overflow: "auto",
            minHeight: 0,
          }}
        >
          <h2 style={{ margin: "0 0 10px", fontSize: 16 }}>Editor Previews</h2>

          {theme && template ? (
            <>
              <div style={{ display: "grid", gap: 10, marginBottom: 10 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 8 }}>
                  <label style={{ display: "grid", gap: 4 }}>
                    <span style={{ fontSize: 12, fontWeight: 600 }}>IDE primary color</span>
                    <select
                      value={previewBorderVariableId}
                      onChange={(e) => {
                        const nextValue = e.target.value;
                        setPreviewBorderVariableId(nextValue);
                        autosaveTheme(nextValue);
                      }}
                      onBlur={() => autosaveTheme()}
                    >
                      <option value="">-- None --</option>
                      {(template?.variables.color ?? []).map((variable) => (
                        <option key={variable.id} value={variable.id}>
                          {variable.name} ({variable.id})
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                {previewBusy ? <p style={{ margin: 0, fontSize: 12 }}>Loading preview sources…</p> : null}
                {previewError ? <p style={{ margin: 0, fontSize: 12, color: "#b00020" }}>{previewError}</p> : null}
              </div>

              <div style={{ flex: 1, minHeight: 0, overflow: "auto" }}>
                {previewError ? (
                  <p style={{ margin: 0, fontSize: 12 }}>Preview samples are unavailable until the preview API endpoint responds.</p>
                ) : selectedSamples.length === 0 ? (
                  <p style={{ margin: 0, fontSize: 12 }}>No preview samples discovered under previews/&lt;language&gt;/.</p>
                ) : (
                  <section style={{ display: "grid", gap: 10, gridTemplateColumns: "1fr 1fr" }}>
                    {generatedThemes ? (
                      <div style={getPreviewFrameStyle("dark")}>
                        <PreviewPane title="Dark Preview" theme={generatedThemes.dark} samples={selectedSamples} />
                      </div>
                    ) : null}
                    {generatedThemes ? (
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
