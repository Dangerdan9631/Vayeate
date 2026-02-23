import { useEffect, useMemo, useRef, useState } from "react";
import { generateThemePair } from "../core/generator";
import type {
  CatalogPin,
  CatalogRemoteSnapshot,
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
  saveCatalogPin,
  saveWorkspaceTemplate,
  syncCatalog,
} from "./api/themeStudioApi";
import { CatalogTab } from "./CatalogTab";
import { previewSamples } from "./preview/samples";
import { createMissingCoverageBindings } from "./state/bindingCoverage";
import { createDefaultTemplate } from "./state/defaultTemplate";
import { TabContainer } from "./TabContainer";
import { TemplateTab } from "./TemplateTab";
import { ThemeTab } from "./ThemeTab";

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
  const [activeTab, setActiveTab] = useState<string>("catalog");
  const [template, setTemplate] = useState<ThemeTemplate>(() => createDefaultTemplate());
  const [templateFileName, setTemplateFileName] = useState<string>(() => toTemplateFileName(createDefaultTemplate()));
  const [workspaceTemplates, setWorkspaceTemplates] = useState<string[]>([]);
  const initialPreviewState = hydratePreviewState(createDefaultTemplate());
  const [selectedSampleIds, setSelectedSampleIds] = useState<string[]>(initialPreviewState.sampleIds);
  const [showDark, setShowDark] = useState(initialPreviewState.showDark);
  const [showLight, setShowLight] = useState(initialPreviewState.showLight);
  const [outputSummary, setOutputSummary] = useState<GeneratedOutputSummary | null>(null);
  const [catalogPin, setCatalogPin] = useState<CatalogPin | null>(null);
  const [catalogPinDraft, setCatalogPinDraft] = useState<CatalogPin | null>(null);
  const [catalogSnapshot, setCatalogSnapshot] = useState<CatalogSnapshot | null>(null);
  const [catalogRemoteSnapshot, setCatalogRemoteSnapshot] = useState<CatalogRemoteSnapshot | null>(null);
  const [catalogReport, setCatalogReport] = useState<CatalogValidationReport | null>(null);
  const [catalogBindingTarget, setCatalogBindingTarget] = useState<ElementBinding["target"]>("colors");
  const [catalogBindingKey, setCatalogBindingKey] = useState("");
  const [catalogBusy, setCatalogBusy] = useState(false);
  const [catalogError, setCatalogError] = useState("");
  const [templateError, setTemplateError] = useState<string>("");
  const [apiMessage, setApiMessage] = useState<string>("");
  const [apiError, setApiError] = useState<string>("");
  const [apiBusy, setApiBusy] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const generated = useMemo(() => generateThemePair(template), [template]);

  const catalogKeyOptions = useMemo(() => {
    if (!catalogSnapshot) return [];
    if (catalogBindingTarget === "colors") return catalogSnapshot.colorKeys;
    if (catalogBindingTarget === "semanticTokenColors") return catalogSnapshot.semanticTokenKeys;
    return catalogSnapshot.textMateScopes;
  }, [catalogBindingTarget, catalogSnapshot]);

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
      setCatalogPinDraft(status.pin);
      setCatalogSnapshot(status.snapshot);
      setCatalogRemoteSnapshot(status.remoteSnapshot);
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
      setCatalogRemoteSnapshot(result.remoteSnapshot);
      setCatalogReport(result.report);
      await refreshCatalogStatus();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Catalog sync failed.";
      setCatalogError(message);
    } finally {
      setCatalogBusy(false);
    }
  }

  function updateCatalogPinField(field: "pinnedVersion" | "updatePolicy", value: string): void {
    setCatalogPinDraft((prev) => {
      if (!prev) return prev;
      if (field === "updatePolicy") {
        return { ...prev, updatePolicy: value as CatalogPin["updatePolicy"] };
      }
      return { ...prev, [field]: value };
    });
  }

  function updateCatalogPinSource(
    field: "themeColorRegistryUrl" | "semanticTokenRegistryUrl" | "scopeGuidanceUrl",
    value: string,
  ): void {
    setCatalogPinDraft((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        sources: {
          ...prev.sources,
          [field]: value,
        },
      };
    });
  }

  async function handleSaveCatalogPin(): Promise<void> {
    if (!catalogPinDraft) return;
    setCatalogBusy(true);
    setCatalogError("");
    try {
      const saved = await saveCatalogPin(catalogPinDraft);
      setCatalogPin(saved);
      setCatalogPinDraft(saved);
      await refreshCatalogStatus();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Catalog pin save failed.";
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

  function addCatalogBinding(key: string): void {
    const normalizedKey = key.trim();
    if (!normalizedKey) return;

    const firstVariable = Object.keys(template.variables)[0] ?? "";
    const exists = template.bindings.some(
      (binding) => binding.target === catalogBindingTarget && binding.key === normalizedKey,
    );
    if (exists) return;

    setTemplate((prev) => ({
      ...prev,
      bindings: [
        ...prev.bindings,
        {
          target: catalogBindingTarget,
          key: normalizedKey,
          variableId: firstVariable,
          strategy: "deriveContrast",
          category: "default",
        },
      ],
    }));
  }

  function addAllMissingCatalogBindings(): void {
    const firstVariable = Object.keys(template.variables)[0] ?? "";
    if (!firstVariable) return;

    const existingByTarget = new Set(
      template.bindings
        .filter((binding) => binding.target === catalogBindingTarget)
        .map((binding) => binding.key),
    );

    const missing = catalogKeyOptions.filter((key) => !existingByTarget.has(key));
    if (missing.length === 0) return;

    setTemplate((prev) => ({
      ...prev,
      bindings: [
        ...prev.bindings,
        ...missing.map((key) => ({
          target: catalogBindingTarget,
          key,
          variableId: firstVariable,
          strategy: "deriveContrast" as const,
          category: "default" as const,
        })),
      ],
    }));
  }

  function handleApplyFullCoverage(): void {
    if (!catalogSnapshot) {
      setApiError("Catalog snapshot is required before applying full coverage.");
      return;
    }

    const result = createMissingCoverageBindings(template, catalogSnapshot);
    if (result.bindings.length === 0) {
      setApiMessage("Full coverage already satisfied for current snapshot.");
      setApiError("");
      return;
    }

    setTemplate((prev) => ({
      ...prev,
      bindings: [...prev.bindings, ...result.bindings],
    }));
    setApiError("");
    setApiMessage(
      `Added ${result.bindings.length} bindings (colors=${result.counts.colors}, semantic=${result.counts.semantic}, token=${result.counts.token}).`,
    );
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
          Multi-tab theme editor: manage catalogs, define templates, and create themes.
        </p>
      </header>

      <TabContainer
        activeTabId={activeTab}
        onTabChange={setActiveTab}
        tabs={[
          {
            id: "catalog",
            label: "Catalog Management",
            content: (
              <CatalogTab
                catalogPin={catalogPin}
                catalogPinDraft={catalogPinDraft}
                catalogSnapshot={catalogSnapshot}
                catalogRemoteSnapshot={catalogRemoteSnapshot}
                catalogReport={catalogReport}
                catalogBindingTarget={catalogBindingTarget}
                catalogBindingKey={catalogBindingKey}
                catalogBusy={catalogBusy}
                catalogError={catalogError}
                catalogKeyOptions={catalogKeyOptions}
                template={template}
                setCatalogBindingTarget={setCatalogBindingTarget}
                setCatalogBindingKey={setCatalogBindingKey}
                updateCatalogPinField={updateCatalogPinField}
                updateCatalogPinSource={updateCatalogPinSource}
                refreshCatalogStatus={refreshCatalogStatus}
                handleSaveCatalogPin={handleSaveCatalogPin}
                setCatalogPinDraft={setCatalogPinDraft}
                handleSyncCatalog={handleSyncCatalog}
                addCatalogBinding={addCatalogBinding}
                addAllMissingCatalogBindings={addAllMissingCatalogBindings}
                handleApplyFullCoverage={handleApplyFullCoverage}
              />
            ),
          },
          {
            id: "template",
            label: "Template Definition",
            content: (
              <TemplateTab
                template={template}
                templateFileName={templateFileName}
                templateError={templateError}
                workspaceTemplates={workspaceTemplates}
                apiBusy={apiBusy}
                apiMessage={apiMessage}
                apiError={apiError}
                fileInputRef={fileInputRef}
                updateTemplateMeta={updateTemplateMeta}
                downloadTemplate={() => downloadTemplate(withPreviewState(template, selectedSampleIds, showDark, showLight))}
                handleImportTemplate={handleImportTemplate}
                handleResetDefault={handleResetDefault}
                setTemplateFileName={setTemplateFileName}
                handleSaveWorkspaceTemplate={handleSaveWorkspaceTemplate}
                refreshWorkspaceTemplates={refreshWorkspaceTemplates}
                handleLoadWorkspaceTemplate={handleLoadWorkspaceTemplate}
                updateVariable={updateVariable}
                updateBinding={updateBinding}
                addBinding={addBinding}
                removeBinding={removeBinding}
              />
            ),
          },
          {
            id: "theme",
            label: "Theme Creation",
            content: (
              <ThemeTab
                generated={generated}
                selectedSampleIds={selectedSampleIds}
                showDark={showDark}
                showLight={showLight}
                outputSummary={outputSummary}
                apiBusy={apiBusy}
                apiMessage={apiMessage}
                apiError={apiError}
                setShowDark={setShowDark}
                setShowLight={setShowLight}
                toggleSample={toggleSample}
                handlePreviewGenerateSummary={handlePreviewGenerateSummary}
                handleGenerateToThemes={handleGenerateToThemes}
              />
            ),
          },
        ]}
      />
    </main>
  );
}