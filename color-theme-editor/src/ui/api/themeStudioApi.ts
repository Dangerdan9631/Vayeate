import type { GeneratedOutputSummary, ThemeTemplate } from "../../domain/types";

interface TemplatesResponse {
  templates: string[];
}

interface TemplateLoadResponse {
  fileName: string;
  template: ThemeTemplate;
}

interface GenerateResponse {
  generated: boolean;
  darkPath: string;
  lightPath: string;
}

interface GeneratePreviewResponse {
  summary: GeneratedOutputSummary;
}

async function parseResponse<T>(response: Response): Promise<T> {
  const data = (await response.json()) as T | { error: string };
  if (!response.ok) {
    const message = (data as { error?: string }).error ?? "Request failed";
    throw new Error(message);
  }
  return data as T;
}

export async function listWorkspaceTemplates(): Promise<string[]> {
  const response = await fetch("/api/templates");
  const data = await parseResponse<TemplatesResponse>(response);
  return data.templates;
}

export async function loadWorkspaceTemplate(fileName: string): Promise<ThemeTemplate> {
  const response = await fetch(`/api/templates/${encodeURIComponent(fileName)}`);
  const data = await parseResponse<TemplateLoadResponse>(response);
  return data.template;
}

export async function saveWorkspaceTemplate(fileName: string, template: ThemeTemplate): Promise<void> {
  const response = await fetch(`/api/templates/${encodeURIComponent(fileName)}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(template),
  });
  await parseResponse<{ saved: boolean }>(response);
}

export async function generateToThemes(template: ThemeTemplate): Promise<GenerateResponse> {
  const response = await fetch("/api/generate", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({ template }),
  });
  return parseResponse<GenerateResponse>(response);
}

export async function previewGenerateSummary(template: ThemeTemplate): Promise<GeneratedOutputSummary> {
  const response = await fetch("/api/generate-preview", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({ template }),
  });
  const data = await parseResponse<GeneratePreviewResponse>(response);
  return data.summary;
}