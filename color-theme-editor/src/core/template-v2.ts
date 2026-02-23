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

function compareSemverDesc(left: string, right: string): number {
  const leftParts = left.split(".").map((part) => Number.parseInt(part, 10) || 0);
  const rightParts = right.split(".").map((part) => Number.parseInt(part, 10) || 0);
  for (let index = 0; index < 3; index += 1) {
    if (leftParts[index] > rightParts[index]) return -1;
    if (leftParts[index] < rightParts[index]) return 1;
  }
  return 0;
}

function incrementVersion(version: string): string {
  const parts = version.split(".");
  const patch = Number.parseInt(parts[2] || "0", 10) || 0;
  return `${parts[0] || "1"}.${parts[1] || "0"}.${patch + 1}`;
}

function toTemplateRef(template: Pick<Template_v2, "id" | "version">): string {
  return `${template.id}@${template.version}`;
}

function parseTemplateRef(templateRef: string): { id: string; version?: string } {
  const separatorIndex = templateRef.lastIndexOf("@");
  if (separatorIndex <= 0 || separatorIndex >= templateRef.length - 1) {
    return { id: templateRef };
  }
  return {
    id: templateRef.slice(0, separatorIndex),
    version: templateRef.slice(separatorIndex + 1),
  };
}

function getVersionedTemplateFileName(templateId: string, version: string): string {
  return `${templateId}.v${version}.template.json`;
}

const VAYEATE_SEMANTIC_MERGED_TEMPLATE_ID = "vayeate-semantic-merged";

const VAYEATE_SEMANTIC_MERGED_CONTRAST_VARIABLES: ContrastVariable[] = [
  { id: "contrast-ui-foreground", name: "ContrastUiForeground", targetRatio: 4.5 },
  { id: "contrast-comment", name: "ContrastComment", targetRatio: 3 },
  { id: "contrast-keyword", name: "ContrastKeyword", targetRatio: 5 },
  { id: "contrast-string", name: "ContrastString", targetRatio: 4.5 },
  { id: "contrast-default", name: "ContrastDefault", targetRatio: 4.5 },
];

const MERGED_DEFAULT_COLOR_VARIABLES = {
  editorBackground: "editor-background",
  listBackground: "list-background",
  chromeBackground: "ide-primary",
  chromeForeground: "ide-primary-foreground",
  editorForeground: "editor-foreground",
  uiForeground: "ui-foreground",
  selection: "editor-selection",
  comment: "comments",
  keyword: "keywords",
  string: "strings",
  syntax: "syntax-highlight",
};

const UI_FOREGROUND_KEYS = new Set<string>([
  "titleBar.activeForeground",
  "titleBar.inactiveForeground",
  "menu.foreground",
  "menu.selectionForeground",
  "menubar.selectionForeground",
  "activityBar.foreground",
  "activityBar.inactiveForeground",
  "breadcrumb.foreground",
  "breadcrumb.focusForeground",
  "breadcrumb.activeSelectionForeground",
  "sideBar.foreground",
  "sideBarSectionHeader.foreground",
  "sideBarTitle.foreground",
  "statusBar.foreground",
  "statusBar.debuggingForeground",
  "statusBarItem.remoteForeground",
  "statusBar.noFolderForeground",
  "statusBarItem.errorForeground",
  "notifications.foreground",
  "notificationCenterHeader.foreground",
  "notificationLink.foreground",
  "notificationsInfoIcon.foreground",
  "notificationsWarningIcon.foreground",
  "notificationsErrorIcon.foreground",
  "extensionButton.prominentForeground",
  "extensionBadge.remoteForeground",
  "editor.foreground",
  "editorInlayHint.foreground",
  "editorCodeLens.foreground",
  "editorLink.activeForeground",
  "editorLineNumber.foreground",
  "editorLineNumber.activeForeground",
  "editorRuler.foreground",
  "terminal.foreground",
  "textPreformat.foreground",
  "editorWidget.foreground",
  "activityBarBadge.foreground",
  "badge.foreground",
  "panelTitle.activeForeground",
  "panelTitle.inactiveForeground",
  "list.activeSelectionForeground",
  "list.focusForeground",
  "list.highlightForeground",
  "list.hoverForeground",
  "list.inactiveSelectionForeground",
  "list.invalidItemForeground",
  "button.foreground",
  "button.secondaryForeground",
  "dropdown.foreground",
  "input.foreground",
  "input.placeholderForeground",
  "inputOption.activeForeground",
  "inputValidation.errorForeground",
  "inputValidation.infoForeground",
  "inputValidation.warningForeground",
  "tab.activeForeground",
  "tab.inactiveForeground",
  "gitDecoration.conflictingResourceForeground",
  "gitDecoration.deletedResourceForeground",
  "gitDecoration.ignoredResourceForeground",
  "gitDecoration.modifiedResourceForeground",
  "gitDecoration.untrackedResourceForeground",
]);

function scopeSegments(scope: string): string[] {
  return scope.split(/\s+/).filter(Boolean);
}

function isCommentScope(scope: string): boolean {
  return (
    scope === "comment"
    || scope.startsWith("comment.")
    || scope === "punctuation.definition.comment"
    || scope.startsWith("punctuation.definition.comment.")
  );
}

function isKeywordScope(scope: string): boolean {
  return scopeSegments(scope).some((segment) =>
    segment === "keyword"
    || segment.startsWith("keyword.")
    || segment === "storage"
    || segment.startsWith("storage."),
  );
}

function isStringScope(scope: string): boolean {
  return scopeSegments(scope).some((segment) =>
    segment === "string"
    || segment.startsWith("string.")
    || segment === "punctuation.definition.string"
    || segment.startsWith("punctuation.definition.string."),
  );
}

function toContrastVariableId(target: CatalogTarget, editorKey: string): string | null {
  if (target === "colors") {
    return UI_FOREGROUND_KEYS.has(editorKey) ? "contrast-ui-foreground" : null;
  }

  if (target === "semanticTokens") {
    const base = editorKey.split(".")[0];
    if (base === "comment") return "contrast-comment";
    if (["keyword", "controlKeyword", "plainKeyword", "modifier", "storageType"].includes(base)) {
      return "contrast-keyword";
    }
    if (["string", "stringEscapeCharacter", "regexp"].includes(base)) {
      return "contrast-string";
    }
    return "contrast-default";
  }

  if (isCommentScope(editorKey)) return "contrast-comment";
  if (isKeywordScope(editorKey)) return "contrast-keyword";
  if (isStringScope(editorKey)) return "contrast-string";
  return "contrast-default";
}

function pickExistingColorVariableId(
  template: Template_v2,
  candidates: string[],
): string | null {
  const available = new Set(template.variables.color.map((variable) => variable.id));
  for (const candidate of candidates) {
    if (available.has(candidate)) {
      return candidate;
    }
  }

  return template.variables.color[0]?.id ?? null;
}

function toMergedColorVariableId(template: Template_v2, target: CatalogTarget, editorKey: string): string | null {
  const lowerKey = editorKey.toLowerCase();

  if (target === "semanticTokens") {
    const base = editorKey.split(".")[0];
    if (base === "comment") {
      return pickExistingColorVariableId(template, [
        MERGED_DEFAULT_COLOR_VARIABLES.comment,
        MERGED_DEFAULT_COLOR_VARIABLES.editorForeground,
      ]);
    }
    if (["keyword", "controlKeyword", "plainKeyword", "modifier", "storageType"].includes(base)) {
      return pickExistingColorVariableId(template, [
        MERGED_DEFAULT_COLOR_VARIABLES.keyword,
        MERGED_DEFAULT_COLOR_VARIABLES.syntax,
      ]);
    }
    if (["string", "stringEscapeCharacter", "regexp"].includes(base)) {
      return pickExistingColorVariableId(template, [
        MERGED_DEFAULT_COLOR_VARIABLES.string,
        MERGED_DEFAULT_COLOR_VARIABLES.syntax,
      ]);
    }
    return pickExistingColorVariableId(template, [
      MERGED_DEFAULT_COLOR_VARIABLES.syntax,
      MERGED_DEFAULT_COLOR_VARIABLES.editorForeground,
    ]);
  }

  if (target === "textMateScopes") {
    if (isCommentScope(editorKey)) {
      return pickExistingColorVariableId(template, [
        MERGED_DEFAULT_COLOR_VARIABLES.comment,
        MERGED_DEFAULT_COLOR_VARIABLES.editorForeground,
      ]);
    }
    if (isKeywordScope(editorKey)) {
      return pickExistingColorVariableId(template, [
        MERGED_DEFAULT_COLOR_VARIABLES.keyword,
        MERGED_DEFAULT_COLOR_VARIABLES.syntax,
      ]);
    }
    if (isStringScope(editorKey)) {
      return pickExistingColorVariableId(template, [
        MERGED_DEFAULT_COLOR_VARIABLES.string,
        MERGED_DEFAULT_COLOR_VARIABLES.syntax,
      ]);
    }
    return pickExistingColorVariableId(template, [
      MERGED_DEFAULT_COLOR_VARIABLES.syntax,
      MERGED_DEFAULT_COLOR_VARIABLES.editorForeground,
    ]);
  }

  if (lowerKey.includes("selection")) {
    return pickExistingColorVariableId(template, [
      MERGED_DEFAULT_COLOR_VARIABLES.selection,
      MERGED_DEFAULT_COLOR_VARIABLES.chromeBackground,
    ]);
  }

  if (lowerKey.includes("background")) {
    if (lowerKey.startsWith("editor") || lowerKey.includes("editor.")) {
      return pickExistingColorVariableId(template, [
        MERGED_DEFAULT_COLOR_VARIABLES.editorBackground,
        MERGED_DEFAULT_COLOR_VARIABLES.listBackground,
      ]);
    }

    if (lowerKey.includes("list") || lowerKey.includes("sidebar") || lowerKey.includes("panel")) {
      return pickExistingColorVariableId(template, [
        MERGED_DEFAULT_COLOR_VARIABLES.listBackground,
        MERGED_DEFAULT_COLOR_VARIABLES.chromeBackground,
      ]);
    }

    return pickExistingColorVariableId(template, [
      MERGED_DEFAULT_COLOR_VARIABLES.chromeBackground,
      MERGED_DEFAULT_COLOR_VARIABLES.editorBackground,
    ]);
  }

  if (lowerKey.includes("foreground")) {
    if (lowerKey.includes("button") || lowerKey.includes("badge")) {
      return pickExistingColorVariableId(template, [
        MERGED_DEFAULT_COLOR_VARIABLES.chromeForeground,
        MERGED_DEFAULT_COLOR_VARIABLES.uiForeground,
      ]);
    }

    if (lowerKey.startsWith("editor") || lowerKey.includes("editor.")) {
      return pickExistingColorVariableId(template, [
        MERGED_DEFAULT_COLOR_VARIABLES.editorForeground,
        MERGED_DEFAULT_COLOR_VARIABLES.uiForeground,
      ]);
    }

    return pickExistingColorVariableId(template, [
      MERGED_DEFAULT_COLOR_VARIABLES.uiForeground,
      MERGED_DEFAULT_COLOR_VARIABLES.editorForeground,
    ]);
  }

  if (lowerKey.includes("cursor") || lowerKey.includes("link") || lowerKey.includes("highlight")) {
    return pickExistingColorVariableId(template, [
      MERGED_DEFAULT_COLOR_VARIABLES.syntax,
      MERGED_DEFAULT_COLOR_VARIABLES.uiForeground,
    ]);
  }

  if (lowerKey.includes("border") || lowerKey.includes("ruler") || lowerKey.includes("shadow")) {
    return pickExistingColorVariableId(template, [
      MERGED_DEFAULT_COLOR_VARIABLES.uiForeground,
      MERGED_DEFAULT_COLOR_VARIABLES.syntax,
    ]);
  }

  return pickExistingColorVariableId(template, [
    MERGED_DEFAULT_COLOR_VARIABLES.syntax,
    MERGED_DEFAULT_COLOR_VARIABLES.editorForeground,
  ]);
}

function ensureVayeateSemanticMergedMappings(template: Template_v2): Template_v2 {
  if (template.id !== VAYEATE_SEMANTIC_MERGED_TEMPLATE_ID) {
    return template;
  }

  const existingContrast = new Map(template.variables.contrast.map((variable) => [variable.id, variable]));
  for (const variable of VAYEATE_SEMANTIC_MERGED_CONTRAST_VARIABLES) {
    if (!existingContrast.has(variable.id)) {
      existingContrast.set(variable.id, variable);
    }
  }

  const byKey = new Map<string, {
    target: CatalogTarget;
    editorKey: string;
    colorVariableId: string | null;
    contrastVariableId: string | null;
  }>();

  for (const mapping of template.mappings) {
    const id = `${mapping.target}::${mapping.editorKey}`;
    const group = byKey.get(id) ?? {
      target: mapping.target,
      editorKey: mapping.editorKey,
      colorVariableId: null,
      contrastVariableId: null,
    };

    if (mapping.variableType === "color") {
      group.colorVariableId = mapping.variableId;
    } else if (mapping.variableType === "contrast") {
      group.contrastVariableId = mapping.variableId;
    }

    byKey.set(id, group);
  }

  for (const group of byKey.values()) {
    if (!group.contrastVariableId) {
      group.contrastVariableId = toContrastVariableId(group.target, group.editorKey);
    }

    if (!group.colorVariableId) {
      group.colorVariableId = toMergedColorVariableId(template, group.target, group.editorKey);
    }
  }

  const normalizedMappings: VariableMapping[] = [];
  for (const group of byKey.values()) {
    if (group.colorVariableId) {
      normalizedMappings.push({
        editorKey: group.editorKey,
        target: group.target,
        variableId: group.colorVariableId,
        variableType: "color",
      });
    }

    if (group.contrastVariableId) {
      normalizedMappings.push({
        editorKey: group.editorKey,
        target: group.target,
        variableId: group.contrastVariableId,
        variableType: "contrast",
      });
    }
  }

  return {
    ...template,
    variables: {
      ...template.variables,
      contrast: Array.from(existingContrast.values()),
    },
    mappings: normalizedMappings,
  };
}

function normalizeTemplate(template: Template_v2): Template_v2 {
  const mappings = (template.mappings ?? []).map((mapping) => {
    const asRecord = mapping as unknown as {
      editorKey?: string;
      target?: CatalogTarget;
      catalogKey?: string;
      catalogTarget?: CatalogTarget;
      variableId: string;
      variableType: VariableType;
    };

    return {
      editorKey: asRecord.editorKey ?? asRecord.catalogKey ?? "",
      target: asRecord.target ?? asRecord.catalogTarget ?? "colors",
      variableId: asRecord.variableId,
      variableType: asRecord.variableType,
    };
  }).filter((mapping) => mapping.editorKey);

  return ensureVayeateSemanticMergedMappings({
    ...template,
    version: template.version || "1.0.0",
    locked: template.locked ?? false,
    mappings,
  });
}

function templateContentSignature(template: Template_v2): string {
  return JSON.stringify({
    id: template.id,
    name: template.name,
    description: template.description,
    catalogRefs: template.catalogRefs,
    variables: template.variables,
    mappings: template.mappings,
  });
}

export async function loadTemplate(studioRoot: string, templateRef: string): Promise<Template_v2 | null> {
  const templatesDir = path.join(studioRoot, TEMPLATES_DIR);
  const parsed = parseTemplateRef(templateRef);

  if (parsed.version) {
    const versionedTemplatePath = path.join(templatesDir, getVersionedTemplateFileName(parsed.id, parsed.version));
    try {
      const content = await fs.readFile(versionedTemplatePath, "utf8");
      return normalizeTemplate(JSON.parse(content) as Template_v2);
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      if (!message.includes("ENOENT")) {
        throw error;
      }
    }
  }

  const legacyTemplatePath = path.join(templatesDir, `${parsed.id}.template.json`);
  try {
    const content = await fs.readFile(legacyTemplatePath, "utf8");
    return normalizeTemplate(JSON.parse(content) as Template_v2);
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (!message.includes("ENOENT")) {
      throw error;
    }
  }

  const templates = await listTemplatesWithMetadata(studioRoot);
  const byId = templates
    .filter((template) => template.id === parsed.id)
    .sort((left, right) => compareSemverDesc(left.version, right.version));
  return byId[0] ?? null;
}

export async function saveTemplate(studioRoot: string, template: Template_v2): Promise<void> {
  const templatesDir = path.join(studioRoot, TEMPLATES_DIR);
  const normalized = normalizeTemplate(template);
  const templatePath = path.join(templatesDir, getVersionedTemplateFileName(normalized.id, normalized.version));
  
  await fs.mkdir(templatesDir, { recursive: true });
  await fs.writeFile(templatePath, `${JSON.stringify(normalized, null, 2)}\n`, "utf8");
}

export async function listTemplates(studioRoot: string): Promise<string[]> {
  const templates = await listTemplatesWithMetadata(studioRoot);
  return templates
    .sort((left, right) => {
      const idCompare = left.id.localeCompare(right.id);
      if (idCompare !== 0) {
        return idCompare;
      }
      return compareSemverDesc(left.version, right.version);
    })
    .map((template) => toTemplateRef(template));
}

export async function listTemplatesWithMetadata(studioRoot: string): Promise<Template_v2[]> {
  const templatesDir = path.join(studioRoot, TEMPLATES_DIR);
  try {
    const files = await fs.readdir(templatesDir);
    const templateFiles = files.filter((file) => file.endsWith(".template.json"));
    const templates = await Promise.all(
      templateFiles.map(async (file) => {
        const templatePath = path.join(templatesDir, file);
        const content = await fs.readFile(templatePath, "utf8");
        const parsed = normalizeTemplate(JSON.parse(content) as Template_v2);

        const versionMatch = file.match(/\.v(\d+\.\d+\.\d+)\.template\.json$/);
        if (versionMatch && !parsed.version) {
          parsed.version = versionMatch[1];
        }

        return parsed;
      })
    );

    const deduped = new Map<string, Template_v2>();
    for (const template of templates) {
      const key = toTemplateRef(template);
      if (!deduped.has(key)) {
        deduped.set(key, template);
      }
    }

    return Array.from(deduped.values());
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message.includes("ENOENT")) {
      return [];
    }
    throw error;
  }
}

export function withTemplateLock(template: Template_v2): Template_v2 {
  const normalized = normalizeTemplate(template);
  if (normalized.locked) {
    return normalized;
  }

  return {
    ...normalized,
    locked: true,
  };
}

export function applyTemplateLockedVersioning(previous: Template_v2 | null, next: Template_v2): Template_v2 {
  const normalizedNext = normalizeTemplate(next);
  if (!previous) {
    return normalizedNext;
  }

  const normalizedPrevious = normalizeTemplate(previous);
  if (!normalizedPrevious.locked) {
    return {
      ...normalizedNext,
      locked: normalizedNext.locked ?? false,
      version: normalizedNext.version || normalizedPrevious.version,
    };
  }

  if (toTemplateRef(normalizedPrevious) === toTemplateRef(normalizedNext)) {
    const hasChanged = templateContentSignature(normalizedPrevious) !== templateContentSignature(normalizedNext);
    if (!hasChanged) {
      return normalizedPrevious;
    }

    return {
      ...normalizedNext,
      version: incrementVersion(normalizedPrevious.version),
      locked: false,
    };
  }

  return {
    ...normalizedNext,
    locked: normalizedNext.locked ?? false,
  };
}

export function createEmptyTemplate(catalogRefs: string[]): Template_v2 {
  return {
    schemaVersion: 2,
    id: generateTemplateId(),
    name: "New Template",
    version: "1.0.0",
    locked: false,
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
  editorKey: string,
  target: CatalogTarget,
  variableId: string,
  variableType: VariableType
): Template_v2 {
  const exists = template.mappings.some(
    (m) => m.editorKey === editorKey && m.target === target
  );
  
  if (exists) {
    return template;
  }
  
  const mapping: VariableMapping = {
    editorKey,
    target,
    variableId,
    variableType,
  };
  
  return {
    ...template,
    mappings: [...template.mappings, mapping],
  };
}

export function removeMapping(template: Template_v2, editorKey: string, target: CatalogTarget): Template_v2 {
  return {
    ...template,
    mappings: template.mappings.filter(
      (m) => !(m.editorKey === editorKey && m.target === target)
    ),
  };
}

export function updateMapping(
  template: Template_v2,
  editorKey: string,
  target: CatalogTarget,
  variableId: string,
  variableType: VariableType
): Template_v2 {
  return {
    ...template,
    mappings: template.mappings.map((m) =>
      m.editorKey === editorKey && m.target === target
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
