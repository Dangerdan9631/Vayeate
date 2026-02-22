import type {
  Catalog,
  Template_v2,
  Theme,
  CatalogAddKeyRequest,
  CatalogRemoveKeyRequest,
  CatalogTarget,
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

// ============================================================================
// Catalog API
// ============================================================================

export async function listCatalogs(): Promise<string[]> {
  const response = await fetch("/api/v2/catalogs");
  const data = await parseResponse<{ catalogs: string[] }>(response);
  return data.catalogs;
}

export async function loadCatalog(catalogName?: string): Promise<Catalog | null> {
  const url = catalogName ? `/api/v2/catalogs/${encodeURIComponent(catalogName)}` : "/api/v2/catalog";
  const response = await fetch(url);
  if (response.status === 404) {
    return null;
  }
  return parseResponse<Catalog>(response);
}

export async function saveCatalog(catalog: Catalog): Promise<void> {
  const response = await fetch(`/api/v2/catalogs/${encodeURIComponent(catalog.name)}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(catalog),
  });
  await parseResponse<{ saved: boolean }>(response);
}

export async function syncCatalog(catalogName: string, updateVersion: boolean): Promise<Catalog> {
  const response = await fetch(`/api/v2/catalogs/${encodeURIComponent(catalogName)}/sync`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ updateVersion }),
  });
  return parseResponse<Catalog>(response);
}

export async function addCatalogKey(catalogName: string, request: Omit<CatalogAddKeyRequest, "catalogName">): Promise<Catalog> {
  const response = await fetch(`/api/v2/catalogs/${encodeURIComponent(catalogName)}/keys`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(request),
  });
  return parseResponse<Catalog>(response);
}

export async function removeCatalogKey(catalogName: string, request: Omit<CatalogRemoveKeyRequest, "catalogName">): Promise<Catalog> {
  const response = await fetch(`/api/v2/catalogs/${encodeURIComponent(catalogName)}/keys`, {
    method: "DELETE",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(request),
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

export async function saveTemplate(template: Template_v2): Promise<void> {
  const response = await fetch(`/api/v2/templates/${encodeURIComponent(template.id)}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(template),
  });
  await parseResponse<{ saved: boolean }>(response);
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

export async function previewThemeGeneration(themeId: string): Promise<ExportPreview> {
  const response = await fetch(`/api/v2/themes/${encodeURIComponent(themeId)}/preview`);
  return parseResponse<ExportPreview>(response);
}

export async function getVariableUsage(templateId: string): Promise<VariableUsage[]> {
  const response = await fetch(`/api/v2/templates/${encodeURIComponent(templateId)}/variable-usage`);
  return parseResponse<VariableUsage[]>(response);
}
