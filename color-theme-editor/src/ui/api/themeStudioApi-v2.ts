import type {
  Catalog,
  Template_v2,
  Theme,
  CatalogAddKeyRequest,
  CatalogRemoveKeyRequest,
  CatalogTarget,
  PreviewSourceLanguage,
  PreviewTokenizedLanguageBatch,
} from "../../domain/types";
import type { ExportPreview } from "../../core/exporter-v2";
import type { CoverageSummary, VariableUsage } from "../../core/generator-v2";

async function parseResponse<T>(response: Response): Promise<T> {
  const data = (await response.json()) as T | { error: string };
  if (!response.ok) {
    const message = (data as { error?: string }).error ?? "Request failed";
    throw new Error(message);
  }
  return data as T;
}

async function tryParseJsonResponse<T>(response: Response): Promise<{ ok: true; data: T } | { ok: false; nonJson: true }> {
  const contentType = response.headers.get("content-type")?.toLowerCase() ?? "";
  if (!contentType.includes("application/json")) {
    return { ok: false, nonJson: true };
  }

  const data = (await response.json()) as T | { error: string };
  if (!response.ok) {
    const message = (data as { error?: string }).error ?? "Request failed";
    throw new Error(message);
  }

  return { ok: true, data: data as T };
}

async function fetchJsonWithPathFallback<T>(absolutePath: string, init?: RequestInit): Promise<T> {
  const relativePath = absolutePath.startsWith("/") ? absolutePath.slice(1) : absolutePath;
  const candidates = [absolutePath, relativePath];

  for (const candidate of candidates) {
    const response = await fetch(candidate, init);
    const parsed = await tryParseJsonResponse<T>(response);
    if (parsed.ok) {
      return parsed.data;
    }
  }

  throw new Error("Preview API returned non-JSON response. Ensure Theme Studio is running with the local API server.");
}

// ============================================================================
// Catalog API
// ============================================================================

export async function listCatalogs(): Promise<Catalog[]> {
  const response = await fetch("/api/v2/catalogs");
  const data = await parseResponse<{ catalogs: Catalog[] }>(response);
  return data.catalogs;
}

export async function loadCatalog(catalogName?: string, version?: string): Promise<Catalog | null> {
  const url = catalogName
    ? version
      ? `/api/v2/catalogs/${encodeURIComponent(catalogName)}/versions/${encodeURIComponent(version)}`
      : `/api/v2/catalogs/${encodeURIComponent(catalogName)}`
    : "/api/v2/catalog";
  const response = await fetch(url);
  if (response.status === 404) {
    return null;
  }
  return parseResponse<Catalog>(response);
}

export async function saveCatalog(catalog: Catalog): Promise<Catalog> {
  const response = await fetch(`/api/v2/catalogs/${encodeURIComponent(catalog.name)}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(catalog),
  });
  const data = await parseResponse<{ saved: boolean; catalog: Catalog }>(response);
  return data.catalog;
}

export async function syncCatalog(catalogName: string, version: string, updateVersion: boolean): Promise<Catalog> {
  const response = await fetch(`/api/v2/catalogs/${encodeURIComponent(catalogName)}/sync`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ updateVersion, version }),
  });
  return parseResponse<Catalog>(response);
}

export async function addCatalogKey(
  catalogName: string,
  request: Omit<CatalogAddKeyRequest, "catalogName">,
  version?: string
): Promise<Catalog> {
  const response = await fetch(`/api/v2/catalogs/${encodeURIComponent(catalogName)}/keys`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ ...request, version }),
  });
  return parseResponse<Catalog>(response);
}

export async function removeCatalogKey(
  catalogName: string,
  request: Omit<CatalogRemoveKeyRequest, "catalogName">,
  version?: string
): Promise<Catalog> {
  const response = await fetch(`/api/v2/catalogs/${encodeURIComponent(catalogName)}/keys`, {
    method: "DELETE",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ ...request, version }),
  });
  return parseResponse<Catalog>(response);
}

export async function deleteCatalogVersion(catalogName: string, version: string): Promise<void> {
  const response = await fetch(`/api/v2/catalogs/${encodeURIComponent(catalogName)}/versions/${encodeURIComponent(version)}`, {
    method: "DELETE",
  });
  await parseResponse<{ deleted: boolean }>(response);
}

export async function lockCatalogVersion(catalogName: string, version: string): Promise<Catalog> {
  const response = await fetch(`/api/v2/catalogs/${encodeURIComponent(catalogName)}/versions/${encodeURIComponent(version)}/lock`, {
    method: "POST",
  });
  return parseResponse<Catalog>(response);
}

// ============================================================================
// Template API
// ============================================================================

export async function listTemplates(): Promise<string[]> {
  const response = await fetch("/api/v2/templates");
  const data = await parseResponse<{ templates: string[] }>(response);
  return data.templates;
}

export async function loadTemplate(templateId: string): Promise<Template_v2> {
  const response = await fetch(`/api/v2/templates/${encodeURIComponent(templateId)}`);
  return parseResponse<Template_v2>(response);
}

export async function saveTemplate(template: Template_v2): Promise<Template_v2> {
  const response = await fetch(`/api/v2/templates/${encodeURIComponent(template.id)}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(template),
  });
  const data = await parseResponse<{ saved: boolean; template: Template_v2 }>(response);
  return data.template;
}

export async function lockTemplateVersion(templateId: string, version: string): Promise<Template_v2> {
  const response = await fetch(`/api/v2/templates/${encodeURIComponent(templateId)}/versions/${encodeURIComponent(version)}/lock`, {
    method: "POST",
  });
  return parseResponse<Template_v2>(response);
}

export async function deleteTemplate(templateId: string): Promise<void> {
  const response = await fetch(`/api/v2/templates/${encodeURIComponent(templateId)}`, {
    method: "DELETE",
  });
  await parseResponse<{ deleted: boolean }>(response);
}

export async function getTemplateCoverage(templateId: string): Promise<{
  colors: CoverageSummary;
  semanticTokens: CoverageSummary;
  textMateScopes: CoverageSummary;
  overall: CoverageSummary;
}> {
  const response = await fetch(`/api/v2/templates/${encodeURIComponent(templateId)}/coverage`);
  return parseResponse(response);
}

// ============================================================================
// Theme API
// ============================================================================

export async function listThemes(): Promise<string[]> {
  const response = await fetch("/api/v2/themes");
  const data = await parseResponse<{ themes: string[] }>(response);
  return data.themes;
}

export async function loadTheme(themeId: string): Promise<Theme> {
  const response = await fetch(`/api/v2/themes/${encodeURIComponent(themeId)}`);
  return parseResponse<Theme>(response);
}

export async function saveTheme(theme: Theme): Promise<void> {
  const response = await fetch(`/api/v2/themes/${encodeURIComponent(theme.id)}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(theme),
  });
  await parseResponse<{ saved: boolean }>(response);
}

export async function deleteTheme(themeId: string): Promise<void> {
  const response = await fetch(`/api/v2/themes/${encodeURIComponent(themeId)}`, {
    method: "DELETE",
  });
  await parseResponse<{ deleted: boolean }>(response);
}

export async function generateTheme(themeId: string): Promise<{
  darkPath: string;
  lightPath: string;
  darkBytes: number;
  lightBytes: number;
}> {
  const response = await fetch(`/api/v2/themes/${encodeURIComponent(themeId)}/generate`, {
    method: "POST",
  });
  return parseResponse(response);
}

export async function cloneTheme(themeId: string, newName: string): Promise<Theme> {
  const response = await fetch(`/api/v2/themes/${encodeURIComponent(themeId)}/clone`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ newName }),
  });
  return parseResponse<Theme>(response);
}

export async function previewThemeGeneration(themeId: string): Promise<ExportPreview> {
  const response = await fetch(`/api/v2/themes/${encodeURIComponent(themeId)}/preview`);
  return parseResponse<ExportPreview>(response);
}

export async function getVariableUsage(templateId: string): Promise<VariableUsage[]> {
  const response = await fetch(`/api/v2/templates/${encodeURIComponent(templateId)}/variable-usage`);
  return parseResponse<VariableUsage[]>(response);
}

// ============================================================================
// Preview API
// ============================================================================

export async function listPreviewSources(): Promise<PreviewSourceLanguage[]> {
  const data = await fetchJsonWithPathFallback<{ languages: PreviewSourceLanguage[] }>("/api/v2/previews/sources");
  return data.languages;
}

export async function fetchPreviewTokens(request: {
  languageIds?: string[];
  sampleIdsByLanguage?: Record<string, string[]>;
} = {}): Promise<PreviewTokenizedLanguageBatch[]> {
  const data = await fetchJsonWithPathFallback<{ batches: PreviewTokenizedLanguageBatch[] }>("/api/v2/previews/tokens", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(request),
  });
  return data.batches;
}
