import type {
  Catalog,
  Template_v2,
  Theme,
  GeneratedTheme,
  ThemeKind,
  CatalogTarget,
} from "../domain/types";
import { adjustBrightness } from "./color";
import {
  resolveColorVariableValue,
  resolveContrastVariableValue,
} from "./theme-v2";
import { getCatalogKeys } from "./catalog-v2";

export interface GenerationContext {
  catalogs: Map<string, Catalog>;
  template: Template_v2;
  theme: Theme;
}

type MappingGroup = {
  target: CatalogTarget;
  editorKey: string;
  colorVariableId?: string;
  contrastVariableId?: string;
};

const DEFAULT_BACKGROUND: Record<ThemeKind, string> = {
  dark: "#1e1e1e",
  light: "#f6f6f6",
};

const UI_COLOR_BACKGROUND_KEYS = new Map<string, [string, string?]>([
  ["titleBar.activeForeground", ["titleBar.activeBackground"]],
  ["titleBar.inactiveForeground", ["titleBar.inactiveBackground"]],
  ["menu.foreground", ["menu.background"]],
  ["menu.selectionForeground", ["menu.selectionBackground"]],
  ["menubar.selectionForeground", ["menubar.selectionBackground"]],
  ["activityBar.foreground", ["activityBar.background"]],
  ["activityBar.inactiveForeground", ["activityBar.background"]],
  ["breadcrumb.foreground", ["breadcrumb.background"]],
  ["breadcrumb.focusForeground", ["breadcrumb.background"]],
  ["breadcrumb.activeSelectionForeground", ["breadcrumb.background"]],
  ["sideBar.foreground", ["sideBar.background"]],
  ["sideBarSectionHeader.foreground", ["sideBarSectionHeader.background"]],
  ["sideBarTitle.foreground", ["sideBar.background"]],
  ["statusBar.foreground", ["statusBar.background"]],
  ["statusBar.debuggingForeground", ["statusBar.debuggingBackground"]],
  ["statusBarItem.remoteForeground", ["statusBar.background"]],
  ["statusBar.noFolderForeground", ["statusBar.noFolderBackground"]],
  ["statusBarItem.errorForeground", ["statusBarItem.errorBackground"]],
  ["notifications.foreground", ["notifications.background"]],
  ["notificationCenterHeader.foreground", ["notificationCenterHeader.background"]],
  ["notificationLink.foreground", ["notifications.background"]],
  ["notificationsInfoIcon.foreground", ["notifications.background"]],
  ["notificationsWarningIcon.foreground", ["notifications.background"]],
  ["notificationsErrorIcon.foreground", ["notifications.background"]],
  ["extensionButton.prominentForeground", ["extensionButton.prominentBackground"]],
  ["extensionBadge.remoteForeground", ["extensionBadge.remoteBackground"]],
  ["editor.foreground", ["editor.background"]],
  ["editorInlayHint.foreground", ["editorInlayHint.background"]],
  ["editorCodeLens.foreground", ["editor.background"]],
  ["editorLink.activeForeground", ["editor.background"]],
  ["editorLineNumber.foreground", ["editorGutter.background", "editor.background"]],
  ["editorLineNumber.activeForeground", ["editorGutter.background", "editor.background"]],
  ["editorRuler.foreground", ["editor.background"]],
  ["terminal.foreground", ["terminal.background"]],
  ["textPreformat.foreground", ["editor.background"]],
  ["editorWidget.foreground", ["editorWidget.background"]],
  ["activityBarBadge.foreground", ["activityBarBadge.background"]],
  ["badge.foreground", ["badge.background"]],
  ["panelTitle.activeForeground", ["panel.background"]],
  ["panelTitle.inactiveForeground", ["panel.background"]],
  ["list.activeSelectionForeground", ["list.activeSelectionBackground"]],
  ["list.focusForeground", ["list.focusBackground"]],
  ["list.highlightForeground", ["list.hoverBackground"]],
  ["list.hoverForeground", ["list.hoverBackground"]],
  ["list.inactiveSelectionForeground", ["list.inactiveSelectionBackground"]],
  ["list.invalidItemForeground", ["sideBar.background"]],
  ["button.foreground", ["button.background"]],
  ["button.secondaryForeground", ["button.secondaryBackground"]],
  ["dropdown.foreground", ["dropdown.background"]],
  ["input.foreground", ["input.background"]],
  ["input.placeholderForeground", ["input.background"]],
  ["inputOption.activeForeground", ["input.background"]],
  ["inputValidation.errorForeground", ["inputValidation.errorBackground"]],
  ["inputValidation.infoForeground", ["inputValidation.infoBackground"]],
  ["inputValidation.warningForeground", ["inputValidation.warningBackground"]],
  ["tab.activeForeground", ["tab.activeBackground"]],
  ["tab.inactiveForeground", ["tab.inactiveBackground"]],
  ["gitDecoration.conflictingResourceForeground", ["sideBar.background"]],
  ["gitDecoration.deletedResourceForeground", ["sideBar.background"]],
  ["gitDecoration.ignoredResourceForeground", ["sideBar.background"]],
  ["gitDecoration.modifiedResourceForeground", ["sideBar.background"]],
  ["gitDecoration.untrackedResourceForeground", ["sideBar.background"]],
]);

function mappingGroupId(target: CatalogTarget, editorKey: string): string {
  return `${target}::${editorKey}`;
}

function buildMappingGroups(template: Template_v2): MappingGroup[] {
  const groups = new Map<string, MappingGroup>();

  for (const mapping of template.mappings) {
    const id = mappingGroupId(mapping.target, mapping.editorKey);
    const existing = groups.get(id) ?? {
      target: mapping.target,
      editorKey: mapping.editorKey,
    };

    if (mapping.variableType === "color") {
      existing.colorVariableId = mapping.variableId;
    } else {
      existing.contrastVariableId = mapping.variableId;
    }

    groups.set(id, existing);
  }

  return Array.from(groups.values());
}

function resolveEditorBackground(
  kind: ThemeKind,
  baseColorsByKey: ReadonlyMap<string, string>,
  generatedColors: Readonly<Record<string, string>>,
): string {
  return generatedColors["editor.background"]
    ?? baseColorsByKey.get("editor.background")
    ?? DEFAULT_BACKGROUND[kind];
}

function resolveColorBackground(
  editorKey: string,
  baseColorsByKey: ReadonlyMap<string, string>,
  generatedColors: Readonly<Record<string, string>>,
): string | null {
  const pair = UI_COLOR_BACKGROUND_KEYS.get(editorKey);
  if (!pair) {
    return null;
  }

  const [backgroundKey, fallbackBackgroundKey] = pair;
  const resolvedPrimary = generatedColors[backgroundKey] ?? baseColorsByKey.get(backgroundKey);
  if (resolvedPrimary) {
    return resolvedPrimary;
  }

  if (!fallbackBackgroundKey) {
    return null;
  }

  return generatedColors[fallbackBackgroundKey] ?? baseColorsByKey.get(fallbackBackgroundKey) ?? null;
}

function applyContrastIfAvailable(
  sourceColor: string,
  backgroundColor: string | null,
  contrastValue: number | null,
): string {
  if (contrastValue == null || backgroundColor == null) {
    return sourceColor;
  }

  return adjustBrightness(sourceColor, backgroundColor, contrastValue, "min");
}

function buildThemeGenerationIssues(kind: ThemeKind, missingSourceKeys: MappingGroup[]): string {
  const details = missingSourceKeys
    .map((group) => `${group.target}:${group.editorKey} (contrast variable: ${group.contrastVariableId})`)
    .join(", ");

  return `Theme generation failed for ${kind}: contrast mappings require a paired color mapping source. Missing source for ${details}.`;
}

export function generateThemeFromContext(ctx: GenerationContext, kind: ThemeKind): GeneratedTheme {
  const colors: Record<string, string> = {};
  const tokenColors: GeneratedTheme["tokenColors"] = [];
  const semanticTokenColors: Record<string, string> = {};

  const groups = buildMappingGroups(ctx.template);
  const baseColorsByKey = new Map<string, string>();
  for (const group of groups) {
    if (group.target !== "colors" || !group.colorVariableId) {
      continue;
    }

    const sourceColor = resolveColorVariableValue(ctx.theme, kind, group.colorVariableId);
    if (!sourceColor) {
      continue;
    }

    baseColorsByKey.set(group.editorKey, sourceColor);
  }

  const missingSourceForContrast: MappingGroup[] = [];

  for (const group of groups) {
    const sourceColor = group.colorVariableId
      ? resolveColorVariableValue(ctx.theme, kind, group.colorVariableId)
      : null;

    if (group.contrastVariableId && !sourceColor) {
      missingSourceForContrast.push(group);
      continue;
    }

    if (!sourceColor) {
      continue;
    }

    const contrastValue = group.contrastVariableId
      ? resolveContrastVariableValue(ctx.theme, kind, group.contrastVariableId)
      : null;

    if (group.target === "colors") {
      const backgroundColor = resolveColorBackground(group.editorKey, baseColorsByKey, colors);
      colors[group.editorKey] = applyContrastIfAvailable(sourceColor, backgroundColor, contrastValue);
      continue;
    }

    if (group.target === "semanticTokens") {
      const editorBackground = resolveEditorBackground(kind, baseColorsByKey, colors);
      semanticTokenColors[group.editorKey] = applyContrastIfAvailable(sourceColor, editorBackground, contrastValue);
      continue;
    }

    if (group.target === "textMateScopes") {
      const editorBackground = resolveEditorBackground(kind, baseColorsByKey, colors);
      tokenColors.push({
        scope: group.editorKey,
        settings: {
          foreground: applyContrastIfAvailable(sourceColor, editorBackground, contrastValue),
        },
      });
    }
  }

  if (missingSourceForContrast.length > 0) {
    throw new Error(buildThemeGenerationIssues(kind, missingSourceForContrast));
  }

  return {
    name: `${ctx.theme.name} (${kind})`,
    type: kind,
    semanticHighlighting: true,
    colors,
    tokenColors,
    semanticTokenColors,
  };
}

export interface ThemeOutput {
  dark: GeneratedTheme;
  light: GeneratedTheme;
}

export function generateThemeOutput(ctx: GenerationContext): ThemeOutput {
  return {
    dark: generateThemeFromContext(ctx, "dark"),
    light: generateThemeFromContext(ctx, "light"),
  };
}

export function validateThemeComplete(ctx: GenerationContext): Array<{ variableId: string; message: string }> {
  const issues: Array<{ variableId: string; message: string }> = [];

  // Check all color variables have dark values
  for (const colorVar of ctx.template.variables.color) {
    const darkValue = resolveColorVariableValue(ctx.theme, "dark", colorVar.id);
    if (!darkValue) {
      issues.push({
        variableId: colorVar.id,
        message: `Color variable "${colorVar.name}" missing dark value`,
      });
    }

    const lightValue = resolveColorVariableValue(ctx.theme, "light", colorVar.id);
    if (!lightValue) {
      issues.push({
        variableId: colorVar.id,
        message: `Color variable "${colorVar.name}" missing light value`,
      });
    }
  }

  // Check all contrast variables have values
  for (const contrastVar of ctx.template.variables.contrast) {
    const darkValue = resolveContrastVariableValue(ctx.theme, "dark", contrastVar.id);
    if (!darkValue) {
      issues.push({
        variableId: contrastVar.id,
        message: `Contrast variable "${contrastVar.name}" missing dark value`,
      });
    }

    const lightValue = resolveContrastVariableValue(ctx.theme, "light", contrastVar.id);
    if (!lightValue) {
      issues.push({
        variableId: contrastVar.id,
        message: `Contrast variable "${contrastVar.name}" missing light value`,
      });
    }
  }

  return issues;
}

export interface CoverageSummary {
  totalCatalogKeys: number;
  mappedKeys: number;
  unmappedKeys: Array<{ catalogName: string; key: string }>;
  coveragePercent: number;
}

export function getCatalogCoverage(ctx: GenerationContext, target: CatalogTarget): CoverageSummary {
  const allKeys: Array<{ catalogName: string; key: string }> = [];
  const uniqueKeySet = new Set<string>();
  
  // Collect all keys from all catalogs
  for (const [catalogName, catalog] of ctx.catalogs) {
    const keys = getCatalogKeys(catalog, target);
    for (const key of keys) {
      if (uniqueKeySet.has(key)) {
        continue;
      }
      uniqueKeySet.add(key);
      allKeys.push({ catalogName, key });
    }
  }
  
  const mappedKeySet = new Set(
    ctx.template.mappings
      .filter((m) => m.target === target)
      .map((m) => m.editorKey)
  );

  const unmappedKeys = allKeys.filter((item) => !mappedKeySet.has(item.key));

  return {
    totalCatalogKeys: allKeys.length,
    mappedKeys: mappedKeySet.size,
    unmappedKeys,
    coveragePercent: allKeys.length > 0 ? (mappedKeySet.size / allKeys.length) * 100 : 0,
  };
}

export function getOverallCoverage(ctx: GenerationContext): CoverageSummary {
  const colors = getCatalogCoverage(ctx, "colors");
  const semanticTokens = getCatalogCoverage(ctx, "semanticTokens");
  const textMateScopes = getCatalogCoverage(ctx, "textMateScopes");

  const totalKeys = colors.totalCatalogKeys + semanticTokens.totalCatalogKeys + textMateScopes.totalCatalogKeys;
  const totalMapped = colors.mappedKeys + semanticTokens.mappedKeys + textMateScopes.mappedKeys;
  const allUnmapped = [...colors.unmappedKeys, ...semanticTokens.unmappedKeys, ...textMateScopes.unmappedKeys];

  return {
    totalCatalogKeys: totalKeys,
    mappedKeys: totalMapped,
    unmappedKeys: allUnmapped,
    coveragePercent: totalKeys > 0 ? (totalMapped / totalKeys) * 100 : 0,
  };
}

export interface VariableUsage {
  variableId: string;
  variableName: string;
  mappingCount: number;
  mappedKeys: string[];
}

export function getVariableUsage(ctx: GenerationContext): VariableUsage[] {
  const usage: Map<string, VariableUsage> = new Map();

  // Initialize all variables
  for (const colorVar of ctx.template.variables.color) {
    usage.set(colorVar.id, {
      variableId: colorVar.id,
      variableName: colorVar.name,
      mappingCount: 0,
      mappedKeys: [],
    });
  }

  for (const contrastVar of ctx.template.variables.contrast) {
    usage.set(contrastVar.id, {
      variableId: contrastVar.id,
      variableName: contrastVar.name,
      mappingCount: 0,
      mappedKeys: [],
    });
  }

  // Count mappings
  for (const mapping of ctx.template.mappings) {
    const varUsage = usage.get(mapping.variableId);
    if (varUsage) {
      varUsage.mappingCount++;
      varUsage.mappedKeys.push(mapping.editorKey);
    }
  }

  return Array.from(usage.values());
}
