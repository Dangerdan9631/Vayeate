import { useEffect, useRef, useState } from "react";
import type {
  Catalog,
  CatalogTarget,
  ContrastRatioValue,
  Template_v2,
  Theme,
  ThemeVariableAssignment,
  ThemeVariableValue,
  VariableType,
} from "../domain/types";
import * as apiV2 from "./api/themeStudioApi-v2";
import { CatalogTabV2 } from "./CatalogTabV2";
import { TabContainer } from "./TabContainer";
import { TemplateTabV2 } from "./TemplateTabV2";
import { ThemeTabV2 } from "./ThemeTabV2";

export function App(): JSX.Element {
  const [activeTab, setActiveTab] = useState<string>("catalog");
  const toCatalogRef = (catalog: Pick<Catalog, "name" | "version">): string => `${catalog.name}@${catalog.version}`;
  const parseCatalogRef = (catalogRef: string): { name: string; version: string } | null => {
    const separatorIndex = catalogRef.lastIndexOf("@");
    if (separatorIndex <= 0 || separatorIndex >= catalogRef.length - 1) {
      return null;
    }
    return {
      name: catalogRef.slice(0, separatorIndex),
      version: catalogRef.slice(separatorIndex + 1),
    };
  };
  const compareSemverDesc = (left: string, right: string): number => {
    const leftParts = left.split(".").map((part) => Number.parseInt(part, 10) || 0);
    const rightParts = right.split(".").map((part) => Number.parseInt(part, 10) || 0);
    for (let index = 0; index < 3; index += 1) {
      if (leftParts[index] > rightParts[index]) return -1;
      if (leftParts[index] < rightParts[index]) return 1;
    }
    return 0;
  };
  const incrementSemverPatch = (version: string): string => {
    const parts = version.split(".");
    const patch = Number.parseInt(parts[2] || "0", 10) || 0;
    return `${parts[0] || "1"}.${parts[1] || "0"}.${patch + 1}`;
  };
  const toTemplateRef = (template: Pick<Template_v2, "id" | "version">): string => `${template.id}@${template.version}`;
  const resolveCatalogFromRef = (catalogRef: string, allCatalogs: Catalog[]): Catalog | null => {
    const parsed = parseCatalogRef(catalogRef);
    if (parsed) {
      return allCatalogs.find((catalog) => catalog.name === parsed.name && catalog.version === parsed.version) ?? null;
    }

    const byName = allCatalogs
      .filter((catalog) => catalog.name === catalogRef)
      .sort((a, b) => compareSemverDesc(a.version, b.version));
    return byName[0] ?? null;
  };
  const hasUnsetMappingsForTemplate = (tmpl: Template_v2, allCatalogs: Catalog[]): boolean => {
    const hasContrastVariables = tmpl.variables.contrast.length > 0;
    const hasContrastMappings = tmpl.mappings.some((mapping) => mapping.variableType === "contrast");
    if (!hasContrastVariables || !hasContrastMappings) {
      return true;
    }

    const mappingKeys = new Set(
      tmpl.mappings.map((mapping) => `${mapping.target}::${mapping.editorKey}`)
    );

    for (const catalogRef of tmpl.catalogRefs) {
      const catalog = resolveCatalogFromRef(catalogRef, allCatalogs);
      if (!catalog) {
        continue;
      }

      const targets: CatalogTarget[] = ["colors", "semanticTokens", "textMateScopes"];
      for (const target of targets) {
        for (const key of catalog.keys[target]) {
          const mappingKey = `${target}::${key}`;
          if (!mappingKeys.has(mappingKey)) {
            return true;
          }
        }
      }
    }

    return false;
  };
  const toLatestCatalogs = (allCatalogs: Catalog[]): Catalog[] => {
    const grouped = new Map<string, Catalog[]>();
    for (const catalog of allCatalogs) {
      const existing = grouped.get(catalog.name) ?? [];
      existing.push(catalog);
      grouped.set(catalog.name, existing);
    }

    return Array.from(grouped.values())
      .map((versions) => versions.sort((a, b) => compareSemverDesc(a.version, b.version))[0])
      .sort((a, b) => a.name.localeCompare(b.name));
  };
  
  // Catalog state
  const [catalogs, setCatalogs] = useState<Catalog[]>([]);
  const [selectedCatalogRef, setSelectedCatalogRef] = useState<string | null>(null);
  const [catalogBusy, setCatalogBusy] = useState(false);
  const [catalogError, setCatalogError] = useState("");
  const catalogSyncRequestRef = useRef(0);
  const catalogSyncInFlightRef = useRef(false);
  const catalogLoadRequestRef = useRef(0);
  
  // Template state
  const [templates, setTemplates] = useState<string[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [template, setTemplate] = useState<Template_v2 | null>(null);
  const [templateBusy, setTemplateBusy] = useState(false);
  const [templateError, setTemplateError] = useState("");
  const templateSaveRequestRef = useRef(0);
  
  // Theme state
  const [themes, setThemes] = useState<string[]>([]);
  const [selectedThemeId, setSelectedThemeId] = useState<string | null>(null);
  const [theme, setTheme] = useState<Theme | null>(null);
  const [themeBusy, setThemeBusy] = useState(false);
  const [themeError, setThemeError] = useState("");
  const themeSaveRequestRef = useRef(0);
  
  // Load initial data
  useEffect(() => {
    void loadCatalogs();
    void loadTemplates();
    void loadThemes();
  }, []);
  
  // Load selected catalog
  useEffect(() => {
    if (selectedCatalogRef) {
      const parsed = parseCatalogRef(selectedCatalogRef);
      if (parsed) {
        void loadCatalog(parsed.name, parsed.version);
      }
    }
  }, [selectedCatalogRef]);
  
  // Load selected template
  useEffect(() => {
    if (selectedTemplateId) {
      void loadTemplate(selectedTemplateId);
    }
  }, [selectedTemplateId]);
  
  // Load selected theme (and its template)
  useEffect(() => {
    if (selectedThemeId) {
      void loadTheme(selectedThemeId);
    }
  }, [selectedThemeId]);
  
  // ===== Catalog Operations =====

  const latestCatalogs = toLatestCatalogs(catalogs);

  function upsertCatalogState(nextCatalog: Catalog): void {
    setCatalogs((prev) => {
      const nextRef = toCatalogRef(nextCatalog);
      const index = prev.findIndex((c) => toCatalogRef(c) === nextRef);
      if (index >= 0) {
        const next = [...prev];
        next[index] = nextCatalog;
        return next;
      }
      return [...prev, nextCatalog];
    });
  }
  
  async function loadCatalogs(): Promise<void> {
    try {
      const catalogList = await apiV2.listCatalogs();
      setCatalogs(catalogList);

      if (selectedCatalogRef && !catalogList.some((catalog) => toCatalogRef(catalog) === selectedCatalogRef)) {
        const fallback = catalogList[0];
        setSelectedCatalogRef(fallback ? toCatalogRef(fallback) : null);
      }

      setCatalogError("");
    } catch (error) {
      setCatalogError(error instanceof Error ? error.message : "Failed to load catalogs");
    }
  }
  
  async function loadCatalog(name: string, version?: string): Promise<void> {
    const loadRequestId = ++catalogLoadRequestRef.current;
    try {
      const catalog = await apiV2.loadCatalog(name, version);
      if (!catalog) {
        return;
      }

      if (loadRequestId !== catalogLoadRequestRef.current) {
        return;
      }

      upsertCatalogState(catalog);
      setCatalogError("");
    } catch (error) {
      setCatalogError(error instanceof Error ? error.message : "Failed to load catalog");
    }
  }
  
  async function handleCreateCatalog(name: string, source: "remote" | "manual"): Promise<void> {
    setCatalogBusy(true);
    setCatalogError("");
    try {
      const newCatalog: Catalog = {
        schemaVersion: 2,
        name,
        version: "1.0.0",
        source,
        locked: source === "manual" ? false : undefined,
        keys: { colors: [], semanticTokens: [], textMateScopes: [] },
        sources: source === "remote" ? {
          themeColorRegistryUrl: "",
          semanticTokenRegistryUrl: "",
          scopeGuidanceUrl: "",
        } : undefined,
      };
      await apiV2.saveCatalog(newCatalog);
      await loadCatalogs();
      setSelectedCatalogRef(toCatalogRef(newCatalog));
    } catch (error) {
      setCatalogError(error instanceof Error ? error.message : "Failed to create catalog");
    } finally {
      setCatalogBusy(false);
    }
  }
  
  async function handleSyncCatalog(catalog: Catalog): Promise<void> {
    if (catalogSyncInFlightRef.current) {
      return;
    }

    const requestId = ++catalogSyncRequestRef.current;
    catalogSyncInFlightRef.current = true;
    setCatalogBusy(true);
    setCatalogError("");

    try {
      const savedCatalog = await apiV2.saveCatalog(catalog);
      upsertCatalogState(savedCatalog);
      setSelectedCatalogRef(toCatalogRef(savedCatalog));
      const syncedCatalog = await apiV2.syncCatalog(savedCatalog.name, savedCatalog.version, true);

      if (requestId !== catalogSyncRequestRef.current) {
        return;
      }

      upsertCatalogState(syncedCatalog);
      setSelectedCatalogRef(toCatalogRef(syncedCatalog));
      await loadCatalogs();
    } catch (error) {
      if (requestId === catalogSyncRequestRef.current) {
        setCatalogError(error instanceof Error ? error.message : "Failed to sync catalog");
      }
    } finally {
      if (requestId === catalogSyncRequestRef.current) {
        setCatalogBusy(false);
      }
      catalogSyncInFlightRef.current = false;
    }
  }

  async function handleDeleteCatalogVersion(catalog: Catalog): Promise<void> {
    setCatalogBusy(true);
    setCatalogError("");
    try {
      await apiV2.deleteCatalogVersion(catalog.name, catalog.version);
      await loadCatalogs();
    } catch (error) {
      setCatalogError(error instanceof Error ? error.message : "Failed to delete catalog version");
    } finally {
      setCatalogBusy(false);
    }
  }

  async function handleLockCatalogVersion(catalog: Catalog): Promise<void> {
    setCatalogBusy(true);
    setCatalogError("");
    try {
      const lockedCatalog = await apiV2.lockCatalogVersion(catalog.name, catalog.version);
      upsertCatalogState(lockedCatalog);
      setSelectedCatalogRef(toCatalogRef(lockedCatalog));
      await loadCatalogs();
    } catch (error) {
      setCatalogError(error instanceof Error ? error.message : "Failed to lock catalog version");
    } finally {
      setCatalogBusy(false);
    }
  }
  
  async function handleAddKey(catalog: Catalog, target: CatalogTarget, key: string): Promise<void> {
    
    setCatalogBusy(true);
    setCatalogError("");
    try {
      const updatedCatalog: Catalog = {
        ...catalog,
        keys: {
          ...catalog.keys,
          [target]: [...catalog.keys[target], key],
        },
      };
      const savedCatalog = await apiV2.saveCatalog(updatedCatalog);
      upsertCatalogState(savedCatalog);
      setSelectedCatalogRef(toCatalogRef(savedCatalog));
      await loadCatalog(savedCatalog.name, savedCatalog.version);
      await loadCatalogs();
    } catch (error) {
      setCatalogError(error instanceof Error ? error.message : "Failed to add key");
    } finally {
      setCatalogBusy(false);
    }
  }
  
  async function handleRemoveKey(catalog: Catalog, target: CatalogTarget, key: string): Promise<void> {
    
    setCatalogBusy(true);
    setCatalogError("");
    try {
      const updatedCatalog: Catalog = {
        ...catalog,
        keys: {
          ...catalog.keys,
          [target]: catalog.keys[target].filter((k) => k !== key),
        },
      };
      const savedCatalog = await apiV2.saveCatalog(updatedCatalog);
      upsertCatalogState(savedCatalog);
      setSelectedCatalogRef(toCatalogRef(savedCatalog));
      await loadCatalog(savedCatalog.name, savedCatalog.version);
      await loadCatalogs();
    } catch (error) {
      setCatalogError(error instanceof Error ? error.message : "Failed to remove key");
    } finally {
      setCatalogBusy(false);
    }
  }
  
  async function handleSaveCatalog(catalog: Catalog): Promise<void> {
    setCatalogBusy(true);
    setCatalogError("");
    try {
      const savedCatalog = await apiV2.saveCatalog(catalog);
      upsertCatalogState(savedCatalog);
      setSelectedCatalogRef(toCatalogRef(savedCatalog));
      await loadCatalog(savedCatalog.name, savedCatalog.version);
      await loadCatalogs();
    } catch (error) {
      setCatalogError(error instanceof Error ? error.message : "Failed to save catalog");
    } finally {
      setCatalogBusy(false);
    }
  }
  
  function handleUpdateSource(
    catalog: Catalog,
    field: "themeColorRegistryUrl" | "semanticTokenRegistryUrl" | "scopeGuidanceUrl",
    value: string
  ): void {
    const catalogRef = toCatalogRef(catalog);
    
    setCatalogs((prev) => {
      const index = prev.findIndex((c) => toCatalogRef(c) === catalogRef);
      if (index < 0) return prev;
      
      const updated = [...prev];
      updated[index] = {
        ...catalog,
        sources: {
          ...catalog.sources,
          [field]: value,
        },
      };
      return updated;
    });
  }
  
  // ===== Template Operations =====
  
  async function loadTemplates(): Promise<void> {
    try {
      const templateList = await apiV2.listTemplates();
      setTemplates(templateList);

      if (selectedTemplateId && !templateList.includes(selectedTemplateId)) {
        setSelectedTemplateId(templateList[0] ?? null);
      }

      setTemplateError("");
    } catch (error) {
      setTemplateError(error instanceof Error ? error.message : "Failed to load templates");
    }
  }
  
  async function loadTemplate(id: string): Promise<void> {
    try {
      const tmpl = await apiV2.loadTemplate(id);
      setTemplate(tmpl);
      setTemplateError("");
    } catch (error) {
      setTemplateError(error instanceof Error ? error.message : "Failed to load template");
    }
  }
  
  async function handleCreateTemplate(name: string): Promise<void> {
    setTemplateBusy(true);
    setTemplateError("");
    try {
      const newTemplate: Template_v2 = {
        schemaVersion: 2,
        id: name.toLowerCase().replace(/\s+/g, "-"),
        name,
        version: "1.0.0",
        locked: false,
        catalogRefs: [],
        variables: { color: [], contrast: [] },
        mappings: [],
      };
      const savedTemplate = await apiV2.saveTemplate(newTemplate);
      await loadTemplates();
      setSelectedTemplateId(toTemplateRef(savedTemplate));
      setTemplate(savedTemplate);
    } catch (error) {
      setTemplateError(error instanceof Error ? error.message : "Failed to create template");
    } finally {
      setTemplateBusy(false);
    }
  }
  
  async function handleLockTemplateVersion(tmpl: Template_v2): Promise<void> {
    if (hasUnsetMappingsForTemplate(tmpl, catalogs)) {
      setTemplateError("All included catalog elements must have a mapping before locking");
      return;
    }

    setTemplateBusy(true);
    setTemplateError("");
    try {
      const lockedTemplate = await apiV2.lockTemplateVersion(tmpl.id, tmpl.version);
      setTemplate(lockedTemplate);
      setSelectedTemplateId(toTemplateRef(lockedTemplate));
      await loadTemplates();
    } catch (error) {
      setTemplateError(error instanceof Error ? error.message : "Failed to lock template version");
    } finally {
      setTemplateBusy(false);
    }
  }

  async function persistTemplateChanges(nextTemplate: Template_v2): Promise<void> {
    const requestId = ++templateSaveRequestRef.current;
    setTemplateBusy(true);
    setTemplateError("");
    try {
      const savedTemplate = await apiV2.saveTemplate(nextTemplate);
      if (requestId !== templateSaveRequestRef.current) {
        return;
      }

      const savedTemplateRef = toTemplateRef(savedTemplate);
      setTemplate(savedTemplate);
      setSelectedTemplateId(savedTemplateRef);
      setTemplates((prev) => (prev.includes(savedTemplateRef) ? prev : [...prev, savedTemplateRef]));
    } catch (error) {
      if (requestId === templateSaveRequestRef.current) {
        setTemplateError(error instanceof Error ? error.message : "Failed to save template");
      }
    } finally {
      if (requestId === templateSaveRequestRef.current) {
        setTemplateBusy(false);
      }
    }
  }

  function applyTemplateMutation(mutator: (current: Template_v2) => Template_v2): void {
    if (!template) return;

    const editableTemplate = template.locked
      ? { ...template, version: incrementSemverPatch(template.version), locked: false }
      : template;
    const nextTemplate = mutator(editableTemplate);
    setTemplate(nextTemplate);

    if (template.locked) {
      setSelectedTemplateId(toTemplateRef(nextTemplate));
    }

    void persistTemplateChanges(nextTemplate);
  }
  
  function handleUpdateTemplateName(name: string): void {
    applyTemplateMutation((current) => ({ ...current, name }));
  }

  function handleUpdateCatalogRefs(catalogRefs: string[]): void {
    applyTemplateMutation((current) => ({ ...current, catalogRefs }));
  }

  function handleSetMappingVariable(
    editorKey: string,
    target: CatalogTarget,
    variableType: VariableType,
    variableId: string | null
  ): void {
    applyTemplateMutation((current) => {
      const remainingMappings = current.mappings.filter(
        (mapping) => !(
          mapping.editorKey === editorKey
          && mapping.target === target
          && mapping.variableType === variableType
        )
      );

      if (!variableId) {
        return {
          ...current,
          mappings: remainingMappings,
        };
      }

      return {
        ...current,
        mappings: [
          ...remainingMappings,
          {
            editorKey,
            target,
            variableId,
            variableType,
          },
        ],
      };
    });
  }
  
  function handleAddColorVariable(name: string): void {
    applyTemplateMutation((current) => {
      const id = name.toLowerCase().replace(/\s+/g, "-");
      const exists = current.variables.color.some((v) => v.id === id);
      if (exists) return current;

      return {
        ...current,
        variables: {
          ...current.variables,
          color: [...current.variables.color, { id, name }],
        },
      };
    });
  }
  
  function handleAddContrastVariable(name: string, targetRatio: number): void {
    applyTemplateMutation((current) => {
      const id = name.toLowerCase().replace(/\s+/g, "-");
      const exists = current.variables.contrast.some((v) => v.id === id);
      if (exists) return current;

      return {
        ...current,
        variables: {
          ...current.variables,
          contrast: [...current.variables.contrast, { id, name, targetRatio }],
        },
      };
    });
  }
  
  function handleRemoveVariable(variableId: string, variableType: VariableType): void {
    applyTemplateMutation((current) => {
      if (variableType === "color") {
        return {
          ...current,
          variables: {
            ...current.variables,
            color: current.variables.color.filter((v) => v.id !== variableId),
          },
          mappings: current.mappings.filter((m) => m.variableId !== variableId || m.variableType !== "color"),
        };
      }

      return {
        ...current,
        variables: {
          ...current.variables,
          contrast: current.variables.contrast.filter((v) => v.id !== variableId),
        },
        mappings: current.mappings.filter((m) => m.variableId !== variableId || m.variableType !== "contrast"),
      };
    });
  }
  
  // ===== Theme Operations =====
  
  async function loadThemes(): Promise<void> {
    try {
      const themeList = await apiV2.listThemes();
      setThemes(themeList);
      setThemeError("");
    } catch (error) {
      setThemeError(error instanceof Error ? error.message : "Failed to load themes");
    }
  }
  
  async function loadTheme(id: string): Promise<void> {
    try {
      const thm = await apiV2.loadTheme(id);
      setTheme(thm);
      
      // Load the associated template
      await loadTemplate(thm.templateRef);
      
      setThemeError("");
    } catch (error) {
      setThemeError(error instanceof Error ? error.message : "Failed to load theme");
    }
  }
  
  async function handleCreateTheme(name: string, templateId: string): Promise<void> {
    setThemeBusy(true);
    setThemeError("");
    try {
      const themeId = name.toLowerCase().replace(/\s+/g, "-");
      const newTheme: Theme = {
        schemaVersion: 2,
        id: themeId,
        name,
        templateRef: templateId,
        values: {
          dark: [],
          light: [],
        },
        output: {
          darkFileName: `${themeId}-dark.json`,
          lightFileName: `${themeId}-light.json`,
          outputDir: "../themes",
        },
      };
      await apiV2.saveTheme(newTheme);
      await loadThemes();
      setSelectedThemeId(newTheme.id);
    } catch (error) {
      setThemeError(error instanceof Error ? error.message : "Failed to create theme");
    } finally {
      setThemeBusy(false);
    }
  }
  
  async function handleSaveTheme(thm: Theme): Promise<void> {
    const saveRequestId = ++themeSaveRequestRef.current;
    setThemeBusy(true);
    if (saveRequestId === themeSaveRequestRef.current) {
      setThemeError("");
    }

    try {
      await apiV2.saveTheme(thm);
      if (saveRequestId !== themeSaveRequestRef.current) {
        return;
      }
    } catch (error) {
      if (saveRequestId === themeSaveRequestRef.current) {
        setThemeError(error instanceof Error ? error.message : "Failed to save theme");
      }
    } finally {
      if (saveRequestId === themeSaveRequestRef.current) {
        setThemeBusy(false);
      }
    }
  }
  
  function handleUpdateThemeName(name: string): void {
    if (!theme) return;
    setTheme({ ...theme, name });
  }
  
  function handleSetVariableValue(
    variableId: string,
    variableType: VariableType,
    variant: "dark" | "light",
    value: string
  ): void {
    if (!theme) return;
    
    const targetArray = variant === "dark" ? theme.values.dark : theme.values.light;
    const existingIndex = targetArray.findIndex((v) => v.variableId === variableId);
    const normalizedValue = value.trim();
    let nextValue: ThemeVariableValue;

    if (variableType === "contrast" && normalizedValue) {
      const parsed = Number.parseFloat(normalizedValue);
      if (!Number.isFinite(parsed)) {
        return;
      }
      const bounded = Math.min(10, Math.max(1, parsed));
      nextValue = Number.parseFloat(bounded.toFixed(2)).toString() as ContrastRatioValue;
    } else {
      nextValue = normalizedValue as ThemeVariableValue;
    }
    
    let updatedArray: ThemeVariableAssignment[];
    if (!normalizedValue) {
      updatedArray = targetArray.filter((v) => v.variableId !== variableId);
    } else if (existingIndex >= 0) {
      updatedArray = [...targetArray];
      updatedArray[existingIndex] = { variableId, value: nextValue };
    } else {
      updatedArray = [...targetArray, { variableId, value: nextValue }];
    }
    
    setTheme({
      ...theme,
      values: {
        ...theme.values,
        [variant]: updatedArray,
      },
    });
  }
  
  function handleSetLightToUseDark(variableId: string, variableType: VariableType): void {
    if (!theme) return;
    
    const lightArray = theme.values.light;
    const existingIndex = lightArray.findIndex((v) => v.variableId === variableId);
    
    let updatedArray: ThemeVariableAssignment[];
    if (existingIndex >= 0) {
      const currentValue = lightArray[existingIndex].value;
      if (currentValue === "useDark") {
        updatedArray = lightArray.filter((v) => v.variableId !== variableId);
      } else {
        updatedArray = [...lightArray];
        updatedArray[existingIndex] = { variableId, value: "useDark" };
      }
    } else {
      updatedArray = [...lightArray, { variableId, value: "useDark" }];
    }
    
    setTheme({
      ...theme,
      values: {
        ...theme.values,
        light: updatedArray,
      },
    });
  }
  
  async function handleGenerateTheme(themeId: string): Promise<void> {
    setThemeBusy(true);
    setThemeError("");
    try {
      await apiV2.generateTheme(themeId);
      setThemeError("");
      alert("Theme generated successfully! Check themes/ folder.");
    } catch (error) {
      setThemeError(error instanceof Error ? error.message : "Failed to generate theme");
    } finally {
      setThemeBusy(false);
    }
  }
  
  async function handleCloneTheme(themeId: string, newName: string): Promise<void> {
    setThemeBusy(true);
    setThemeError("");
    try {
      await apiV2.cloneTheme(themeId, newName);
      await loadThemes();
      setSelectedThemeId(newName.toLowerCase().replace(/\s+/g, "-"));
    } catch (error) {
      setThemeError(error instanceof Error ? error.message : "Failed to clone theme");
    } finally {
      setThemeBusy(false);
    }
  }
  
  return (
    <main style={{ fontFamily: "Segoe UI, sans-serif", padding: 20, lineHeight: 1.35, color: "#1f1f1f", height: "100%", boxSizing: "border-box", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <header style={{ marginBottom: 14 }}>
        <h1 style={{ margin: "0 0 8px" }}>Vayeate Theme Studio v2</h1>
        <p style={{ margin: 0 }}>
          Catalog → Template → Theme workflow. Manage catalogs of theme keys, define templates with variables and mappings, create themes with variable values.
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
              <CatalogTabV2
                catalogs={catalogs}
                selectedCatalogRef={selectedCatalogRef}
                onSelectCatalog={setSelectedCatalogRef}
                onCreateCatalog={handleCreateCatalog}
                onSyncCatalog={handleSyncCatalog}
                onDeleteCatalogVersion={handleDeleteCatalogVersion}
                onLockCatalogVersion={handleLockCatalogVersion}
                onAddKey={handleAddKey}
                onRemoveKey={handleRemoveKey}
                onSaveCatalog={handleSaveCatalog}
                onUpdateSource={handleUpdateSource}
                busy={catalogBusy}
                error={catalogError}
              />
            ),
          },
          {
            id: "template",
            label: "Template Definition",
            content: (
              <TemplateTabV2
                templates={templates}
                selectedTemplateId={selectedTemplateId}
                template={template}
                catalogs={catalogs}
                onSelectTemplate={setSelectedTemplateId}
                onCreateTemplate={handleCreateTemplate}
                onLockTemplateVersion={handleLockTemplateVersion}
                canLockTemplate={template ? !hasUnsetMappingsForTemplate(template, catalogs) : false}
                onUpdateTemplateName={handleUpdateTemplateName}
                onUpdateCatalogRefs={handleUpdateCatalogRefs}
                onAddColorVariable={handleAddColorVariable}
                onAddContrastVariable={handleAddContrastVariable}
                onRemoveVariable={handleRemoveVariable}
                onSetMappingVariable={handleSetMappingVariable}
                busy={templateBusy}
                error={templateError}
              />
            ),
          },
          {
            id: "theme",
            label: "Theme Creation",
            content: (
              <ThemeTabV2
                themes={themes}
                selectedThemeId={selectedThemeId}
                theme={theme}
                template={template}
                onSelectTheme={setSelectedThemeId}
                onCreateTheme={handleCreateTheme}
                onSaveTheme={handleSaveTheme}
                onUpdateThemeName={handleUpdateThemeName}
                onSetVariableValue={handleSetVariableValue}
                onSetLightToUseDark={handleSetLightToUseDark}
                onGenerateTheme={handleGenerateTheme}
                onCloneTheme={handleCloneTheme}
                templates={templates}
                busy={themeBusy}
                error={themeError}
              />
            ),
          },
        ]}
      />
    </main>
  );
}
