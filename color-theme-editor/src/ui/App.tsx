import { useEffect, useMemo, useRef, useState } from "react";
import { generateThemePair } from "../core/generator";
import type {
  CatalogPin,
  CatalogSnapshot,
  CatalogValidationReport,
  ElementBinding,
  GeneratedOutputSummary,
  PreviewSample,
  ThemeTemplate,
} from "../domain/types";
import {
  generateToThemes,
  getCatalogStatus,
  listWorkspaceTemplates,
  loadWorkspaceTemplate,
  previewGenerateSummary,
  saveWorkspaceTemplate,
  syncCatalog,
} from "./api/themeStudioApi";
import { previewSamples } from "./preview/samples";
import { PreviewPane } from "./preview/PreviewPane";
import { createDefaultTemplate } from "./state/defaultTemplate";

const CATEGORY_OPTIONS: Array<ElementBinding["category"]> = ["default", "keyword", "string", "comment"];

function downloadTemplate(template: ThemeTemplate): void {
  const blob = new Blob([`${JSON.stringify(template, null, 2)}\n`], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${template.id}.template.json`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function toTemplateFileName(template: ThemeTemplate): string {
  const normalized = template.id.trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "");
  const fallback = normalized || "theme-template";
  return `${fallback}.template.json`;
}

function toPreviewSessionSamples(sampleIds: string[]): PreviewSample[] {
  return previewSamples
    .filter((sample) => sampleIds.includes(sample.id))
    .map((sample) => ({
      id: sample.id,
      label: sample.label,
      relativePath: sample.relativePath,
      language: sample.language,
    }));
}

function withPreviewState(template: ThemeTemplate, selectedSampleIds: string[], showDark: boolean, showLight: boolean): ThemeTemplate {
  return {
    ...template,
    preview: {
      id: template.preview?.id ?? `${template.id}-preview`,
      samples: toPreviewSessionSamples(selectedSampleIds),
      showDark,
      showLight,
    },
  };
}

function hydratePreviewState(template: ThemeTemplate): { sampleIds: string[]; showDark: boolean; showLight: boolean } {
  const sampleIds = template.preview?.samples?.map((sample) => sample.id) ?? previewSamples.map((sample) => sample.id);
  return {
    sampleIds,
    showDark: template.preview?.showDark ?? true,
    showLight: template.preview?.showLight ?? true,
  };
}

export function App(): JSX.Element {
  const [template, setTemplate] = useState<ThemeTemplate>(() => createDefaultTemplate());
  const [templateFileName, setTemplateFileName] = useState<string>(() => toTemplateFileName(createDefaultTemplate()));
  const [workspaceTemplates, setWorkspaceTemplates] = useState<string[]>([]);
  const initialPreviewState = hydratePreviewState(createDefaultTemplate());
  const [selectedSampleIds, setSelectedSampleIds] = useState<string[]>(initialPreviewState.sampleIds);
  const [showDark, setShowDark] = useState(initialPreviewState.showDark);
  const [showLight, setShowLight] = useState(initialPreviewState.showLight);
  const [outputSummary, setOutputSummary] = useState<GeneratedOutputSummary | null>(null);
  const [catalogPin, setCatalogPin] = useState<CatalogPin | null>(null);
  const [catalogSnapshot, setCatalogSnapshot] = useState<CatalogSnapshot | null>(null);
  const [catalogReport, setCatalogReport] = useState<CatalogValidationReport | null>(null);
  const [catalogBusy, setCatalogBusy] = useState(false);
  const [catalogError, setCatalogError] = useState("");
  const [templateError, setTemplateError] = useState<string>("");
  const [apiMessage, setApiMessage] = useState<string>("");
  const [apiError, setApiError] = useState<string>("");
  const [apiBusy, setApiBusy] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const generated = useMemo(() => generateThemePair(template), [template]);
  const selectedSamples = useMemo(
    () => previewSamples.filter((sample) => selectedSampleIds.includes(sample.id)),
    [selectedSampleIds],
  );

  const variableEntries = useMemo(() => Object.entries(template.variables), [template.variables]);

  useEffect(() => {
    void refreshWorkspaceTemplates();
    void refreshCatalogStatus();
  }, []);

  function updateTemplateMeta(field: "name" | "description", value: string): void {
    setTemplate((prev) => ({ ...prev, [field]: value }));
  }

  async function refreshWorkspaceTemplates(): Promise<void> {
    try {
      const files = await listWorkspaceTemplates();
      setWorkspaceTemplates(files);
      setApiError("");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to list workspace templates.";
      setApiError(message);
    }
  }

  async function refreshCatalogStatus(): Promise<void> {
    try {
      const status = await getCatalogStatus();
      setCatalogPin(status.pin);
      setCatalogSnapshot(status.snapshot);
      setCatalogReport(status.report);
      setCatalogError("");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load catalog status.";
      setCatalogError(message);
    }
  }

  async function handleSyncCatalog(): Promise<void> {
    setCatalogBusy(true);
    setCatalogError("");
    try {
      const result = await syncCatalog();
      setCatalogSnapshot(result.snapshot);
      setCatalogReport(result.report);
      await refreshCatalogStatus();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Catalog sync failed.";
      setCatalogError(message);
    } finally {
      setCatalogBusy(false);
    }
  }

  function updateVariable(variableId: string, field: "label" | "value", value: string): void {
    setTemplate((prev) => ({
      ...prev,
      variables: {
        ...prev.variables,
        [variableId]: {
          ...prev.variables[variableId],
          [field]: value,
        },
      },
    }));
  }

  function updateBinding(index: number, field: keyof ElementBinding, value: string): void {
    setTemplate((prev) => {
      const nextBindings = [...prev.bindings];
      const binding = { ...nextBindings[index] };

      if (field === "category") {
        binding.category = value as ElementBinding["category"];
      } else if (field === "variableId") {
        binding.variableId = value;
      } else if (field === "strategy") {
        binding.strategy = value as ElementBinding["strategy"];
      } else if (field === "target") {
        binding.target = value as ElementBinding["target"];
      } else if (field === "key") {
        binding.key = value;
      }

      nextBindings[index] = binding;
      return { ...prev, bindings: nextBindings };
    });
  }

  function addBinding(): void {
    const firstVariable = Object.keys(template.variables)[0] ?? "";
    setTemplate((prev) => ({
      ...prev,
      bindings: [
        ...prev.bindings,
        {
          target: "colors",
          key: "editor.selectionBackground",
          variableId: firstVariable,
          strategy: "deriveContrast",
          category: "default",
        },
      ],
    }));
  }

  function removeBinding(index: number): void {
    setTemplate((prev) => ({
      ...prev,
      bindings: prev.bindings.filter((_, bindingIndex) => bindingIndex !== index),
    }));
  }

  function toggleSample(sampleId: string): void {
    setSelectedSampleIds((prev) =>
      prev.includes(sampleId) ? prev.filter((id) => id !== sampleId) : [...prev, sampleId],
    );
  }

  function handleImportTemplate(file: File): void {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as ThemeTemplate;
        if (parsed.schemaVersion !== 1 || !parsed.variables || !parsed.bindings) {
          throw new Error("Invalid template schema.");
        }
        setTemplate(parsed);
        const previewState = hydratePreviewState(parsed);
        setSelectedSampleIds(previewState.sampleIds);
        setShowDark(previewState.showDark);
        setShowLight(previewState.showLight);
        setOutputSummary(null);
        setTemplateError("");
      } catch (error) {
        const message = error instanceof Error ? error.message : "Template import failed.";
        setTemplateError(message);
      }
    };
    reader.readAsText(file);
  }

  async function handleSaveWorkspaceTemplate(): Promise<void> {
    setApiBusy(true);
    setApiError("");
    setApiMessage("");
    try {
      const templateWithPreview = withPreviewState(template, selectedSampleIds, showDark, showLight);
      await saveWorkspaceTemplate(templateFileName, templateWithPreview);
      setTemplate(templateWithPreview);
      await refreshWorkspaceTemplates();
      setApiMessage(`Saved ${templateFileName} to color-theme-editor/templates.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Template save failed.";
      setApiError(message);
    } finally {
      setApiBusy(false);
    }
  }

  async function handleLoadWorkspaceTemplate(): Promise<void> {
    if (!templateFileName) return;
    setApiBusy(true);
    setApiError("");
    setApiMessage("");
    try {
      const loaded = await loadWorkspaceTemplate(templateFileName);
      setTemplate(loaded);
      const previewState = hydratePreviewState(loaded);
      setSelectedSampleIds(previewState.sampleIds);
      setShowDark(previewState.showDark);
      setShowLight(previewState.showLight);
      setOutputSummary(null);
      setApiMessage(`Loaded ${templateFileName} from workspace templates.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Template load failed.";
      setApiError(message);
    } finally {
      setApiBusy(false);
    }
  }

  async function handleGenerateToThemes(): Promise<void> {
    setApiBusy(true);
    setApiError("");
    setApiMessage("");
    try {
      const templateWithPreview = withPreviewState(template, selectedSampleIds, showDark, showLight);
      const result = await generateToThemes(templateWithPreview);
      setTemplate(templateWithPreview);
      setApiMessage(`Generated themes:\n${result.darkPath}\n${result.lightPath}`);
      setOutputSummary(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Theme generation failed.";
      setApiError(message);
    } finally {
      setApiBusy(false);
    }
  }

  function handleResetDefault(): void {
    const nextTemplate = createDefaultTemplate();
    const previewState = hydratePreviewState(nextTemplate);
    setTemplate(nextTemplate);
    setTemplateFileName(toTemplateFileName(nextTemplate));
    setSelectedSampleIds(previewState.sampleIds);
    setShowDark(previewState.showDark);
    setShowLight(previewState.showLight);
    setOutputSummary(null);
    setApiError("");
    setApiMessage("");
  }

  async function handlePreviewGenerateSummary(): Promise<void> {
    setApiBusy(true);
    setApiError("");
    setApiMessage("");
    try {
      const templateWithPreview = withPreviewState(template, selectedSampleIds, showDark, showLight);
      const summary = await previewGenerateSummary(templateWithPreview);
      setTemplate(templateWithPreview);
      setOutputSummary(summary);
      setApiMessage("Generation summary refreshed.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Generation summary failed.";
      setApiError(message);
    } finally {
      setApiBusy(false);
    }
  }

  return (
    <main style={{ fontFamily: "Segoe UI, sans-serif", padding: 20, lineHeight: 1.35, color: "#1f1f1f" }}>
      <header style={{ marginBottom: 14 }}>
        <h1 style={{ margin: "0 0 8px" }}>Vayeate Theme Studio</h1>
        <p style={{ margin: 0 }}>
          Phase 2 editor in progress: template and binding controls plus custom side-by-side preview from repository examples.
        </p>
      </header>

      <section style={{ display: "grid", gap: 12, gridTemplateColumns: "1.15fr 1.85fr" }}>
        <section style={{ display: "grid", gap: 12, alignContent: "start" }}>
          <article style={{ border: "1px solid #d0d0d0", borderRadius: 8, padding: 12 }}>
            <h2 style={{ margin: "0 0 10px", fontSize: 16 }}>Template</h2>
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
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button
                  type="button"
                  onClick={() => downloadTemplate(withPreviewState(template, selectedSampleIds, showDark, showLight))}
                >
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
                <button type="button" onClick={() => void handlePreviewGenerateSummary()} disabled={apiBusy}>
                  Refresh Output Summary
                </button>
                <button type="button" onClick={() => void handleGenerateToThemes()} disabled={apiBusy}>
                  Generate to themes
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
            <h2 style={{ margin: "0 0 10px", fontSize: 16 }}>Output summary</h2>
            {outputSummary ? (
              <div style={{ display: "grid", gap: 8 }}>
                {[outputSummary.dark, outputSummary.light].map((item) => (
                  <div key={item.fileName} style={{ border: "1px solid #e1e1e1", borderRadius: 6, padding: 8 }}>
                    <div style={{ fontWeight: 600 }}>{item.fileName}</div>
                    <div style={{ fontSize: 12 }}>Path: {item.targetPath}</div>
                    <div style={{ fontSize: 12 }}>Exists: {item.exists ? "yes" : "no"}</div>
                    <div style={{ fontSize: 12 }}>Bytes: {item.beforeBytes} → {item.afterBytes}</div>
                    <div style={{ fontSize: 12, color: item.changed ? "#9a4f00" : "#0b5f2a" }}>
                      {item.changed ? "Will update file" : "No byte-level change"}
                    </div>
                  </div>
                ))}
                <div style={{ fontSize: 12 }}>
                  Colors (dark/light): {outputSummary.colorCount.dark}/{outputSummary.colorCount.light}
                </div>
                <div style={{ fontSize: 12 }}>
                  Token rules (dark/light): {outputSummary.tokenCount.dark}/{outputSummary.tokenCount.light}
                </div>
              </div>
            ) : (
              <p style={{ margin: 0, fontSize: 12, color: "#666" }}>
                Run <strong>Refresh Output Summary</strong> to inspect existing vs generated output before writing files.
              </p>
            )}
          </article>

          <article style={{ border: "1px solid #d0d0d0", borderRadius: 8, padding: 12 }}>
            <h2 style={{ margin: "0 0 10px", fontSize: 16 }}>Catalog sync</h2>
            <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
              <button type="button" onClick={() => void refreshCatalogStatus()} disabled={catalogBusy}>
                Refresh Status
              </button>
              <button type="button" onClick={() => void handleSyncCatalog()} disabled={catalogBusy}>
                Sync Snapshot
              </button>
            </div>
            {catalogPin ? (
              <div style={{ fontSize: 12, marginBottom: 8 }}>
                <div>Pinned version: {catalogPin.pinnedVersion}</div>
                <div>Policy: {catalogPin.updatePolicy}</div>
              </div>
            ) : null}
            {catalogSnapshot ? (
              <div style={{ fontSize: 12, marginBottom: 8 }}>
                <div>Generated: {catalogSnapshot.generatedAt}</div>
                <div>Color keys: {catalogSnapshot.colorKeys.length}</div>
                <div>Semantic tokens: {catalogSnapshot.semanticTokenKeys.length}</div>
                <div>TextMate scopes: {catalogSnapshot.textMateScopes.length}</div>
              </div>
            ) : (
              <p style={{ margin: "0 0 8px", fontSize: 12, color: "#666" }}>
                No snapshot yet. Run <strong>Sync Snapshot</strong> to create `catalog/snapshot.json` and `catalog/report.json`.
              </p>
            )}
            {catalogReport ? (
              <div style={{ fontSize: 12 }}>
                <div style={{ color: catalogReport.valid ? "#0b5f2a" : "#b00020", marginBottom: 4 }}>
                  Validation: {catalogReport.valid ? "valid" : "has errors"}
                </div>
                {catalogReport.issues.length > 0 ? (
                  <ul style={{ margin: 0, paddingLeft: 18 }}>
                    {catalogReport.issues.map((issue, index) => (
                      <li key={`${issue.code}-${index}`} style={{ color: issue.severity === "error" ? "#b00020" : "#9a4f00" }}>
                        [{issue.severity}] {issue.code}: {issue.message}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div>No validation issues.</div>
                )}
              </div>
            ) : null}
            {catalogError ? <p style={{ margin: "8px 0 0", fontSize: 12, color: "#b00020" }}>{catalogError}</p> : null}
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
        </section>

        <section style={{ display: "grid", gap: 10, alignContent: "start" }}>
          <article style={{ border: "1px solid #d0d0d0", borderRadius: 8, padding: 12 }}>
            <h2 style={{ margin: "0 0 10px", fontSize: 16 }}>Preview controls</h2>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 8 }}>
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
          </article>

          <section style={{ display: "grid", gap: 10, gridTemplateColumns: showDark && showLight ? "1fr 1fr" : "1fr" }}>
            {showDark ? <PreviewPane title="Dark Preview" theme={generated.dark} samples={selectedSamples} /> : null}
            {showLight ? <PreviewPane title="Light Preview" theme={generated.light} samples={selectedSamples} /> : null}
          </section>
        </section>
      </section>
    </main>
  );
}