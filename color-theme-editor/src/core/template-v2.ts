import { promises as fs } from "node:fs";
import path from "node:path";
import type {
  Template_v2,
  ColorVariable_v2,
  ContrastVariable,
  VariableMapping,
  CatalogTarget,
  VariableType,
} from "../domain/types";

const TEMPLATES_DIR = "templates";

export async function loadTemplate(studioRoot: string, templateId: string): Promise<Template_v2 | null> {
  const templatePath = path.join(studioRoot, TEMPLATES_DIR, `${templateId}.template.json`);
  try {
    const content = await fs.readFile(templatePath, "utf8");
    return JSON.parse(content) as Template_v2;
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message.includes("ENOENT")) {
      return null;
    }
    throw error;
  }
}

export async function saveTemplate(studioRoot: string, template: Template_v2): Promise<void> {
  const templatesDir = path.join(studioRoot, TEMPLATES_DIR);
  const templatePath = path.join(templatesDir, `${template.id}.template.json`);
  
  await fs.mkdir(templatesDir, { recursive: true });
  await fs.writeFile(templatePath, `${JSON.stringify(template, null, 2)}\n`, "utf8");
}

export async function listTemplates(studioRoot: string): Promise<string[]> {
  const templatesDir = path.join(studioRoot, TEMPLATES_DIR);
  try {
    const files = await fs.readdir(templatesDir);
    return files
      .filter((file) => file.endsWith(".template.json"))
      .map((file) => file.replace(".template.json", ""));
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message.includes("ENOENT")) {
      return [];
    }
    throw error;
  }
}

export function createEmptyTemplate(catalogRefs: string[]): Template_v2 {
  return {
    schemaVersion: 2,
    id: generateTemplateId(),
    name: "New Template",
    catalogRefs,
    variables: {
      color: [],
      contrast: [],
    },
    mappings: [],
  };
}

export function addColorVariable(template: Template_v2, name: string): Template_v2 {
  const id = generateVariableId(name);
  const variable: ColorVariable_v2 = { id, name };
  
  return {
    ...template,
    variables: {
      ...template.variables,
      color: [...template.variables.color, variable],
    },
  };
}

export function addContrastVariable(template: Template_v2, name: string, targetRatio: number): Template_v2 {
  const id = generateVariableId(name);
  const variable: ContrastVariable = { id, name, targetRatio };
  
  return {
    ...template,
    variables: {
      ...template.variables,
      contrast: [...template.variables.contrast, variable],
    },
  };
}

export function removeVariable(template: Template_v2, variableId: string, variableType: VariableType): Template_v2 {
  const updatedVariables = { ...template.variables };
  
  if (variableType === "color") {
    updatedVariables.color = updatedVariables.color.filter((v) => v.id !== variableId);
  } else {
    updatedVariables.contrast = updatedVariables.contrast.filter((v) => v.id !== variableId);
  }
  
  // Remove mappings that reference this variable
  const updatedMappings = template.mappings.filter((m) => m.variableId !== variableId);
  
  return {
    ...template,
    variables: updatedVariables,
    mappings: updatedMappings,
  };
}

export function updateVariableName(
  template: Template_v2,
  variableId: string,
  variableType: VariableType,
  newName: string
): Template_v2 {
  const updatedVariables = { ...template.variables };
  
  if (variableType === "color") {
    updatedVariables.color = updatedVariables.color.map((v) =>
      v.id === variableId ? { ...v, name: newName } : v
    );
  } else {
    updatedVariables.contrast = updatedVariables.contrast.map((v) =>
      v.id === variableId ? { ...v, name: newName } : v
    );
  }
  
  return {
    ...template,
    variables: updatedVariables,
  };
}

export function addMapping(
  template: Template_v2,
  catalogName: string,
  catalogKey: string,
  catalogTarget: CatalogTarget,
  variableId: string,
  variableType: VariableType
): Template_v2 {
  const exists = template.mappings.some(
    (m) => m.catalogName === catalogName && m.catalogKey === catalogKey && m.catalogTarget === catalogTarget
  );
  
  if (exists) {
    return template;
  }
  
  const mapping: VariableMapping = {
    catalogName,
    catalogKey,
    catalogTarget,
    variableId,
    variableType,
  };
  
  return {
    ...template,
    mappings: [...template.mappings, mapping],
  };
}

export function removeMapping(template: Template_v2, catalogName: string, catalogKey: string, catalogTarget: CatalogTarget): Template_v2 {
  return {
    ...template,
    mappings: template.mappings.filter(
      (m) => !(m.catalogName === catalogName && m.catalogKey === catalogKey && m.catalogTarget === catalogTarget)
    ),
  };
}

export function updateMapping(
  template: Template_v2,
  catalogName: string,
  catalogKey: string,
  catalogTarget: CatalogTarget,
  variableId: string,
  variableType: VariableType
): Template_v2 {
  return {
    ...template,
    mappings: template.mappings.map((m) =>
      m.catalogName === catalogName && m.catalogKey === catalogKey && m.catalogTarget === catalogTarget
        ? { ...m, variableId, variableType }
        : m
    ),
  };
}

function generateTemplateId(): string {
  return `template-${Date.now()}`;
}

function generateVariableId(name: string): string {
  const normalized = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  return `${normalized}-${Date.now().toString(36)}`;
}

export function getTemplateVariable(template: Template_v2, variableId: string): ColorVariable_v2 | ContrastVariable | null {
  const colorVar = template.variables.color.find((v) => v.id === variableId);
  if (colorVar) return colorVar;
  
  const contrastVar = template.variables.contrast.find((v) => v.id === variableId);
  if (contrastVar) return contrastVar;
  
  return null;
}

export function getMappingsForVariable(template: Template_v2, variableId: string): VariableMapping[] {
  return template.mappings.filter((m) => m.variableId === variableId);
}

export function getUnmappedVariables(template: Template_v2): Array<ColorVariable_v2 | ContrastVariable> {
  const mappedIds = new Set(template.mappings.map((m) => m.variableId));
  const unmappedColor = template.variables.color.filter((v) => !mappedIds.has(v.id));
  const unmappedContrast = template.variables.contrast.filter((v) => !mappedIds.has(v.id));
  return [...unmappedColor, ...unmappedContrast];
}
