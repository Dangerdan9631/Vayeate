import type {
  Catalog,
  Template_v2,
  Theme,
  GeneratedTheme,
  ThemeKind,
  ColorHex,
  CatalogTarget,
} from "../domain/types";
import { resolveVariableValue } from "./theme-v2";
import { getCatalogKeys } from "./catalog-v2";

export interface GenerationContext {
  catalogs: Map<string, Catalog>;
  template: Template_v2;
  theme: Theme;
}

export function generateThemeFromContext(ctx: GenerationContext, kind: ThemeKind): GeneratedTheme {
  const colors: Record<string, string> = {};
  const tokenColors: GeneratedTheme["tokenColors"] = [];
  const semanticTokenColors: Record<string, string> = {};

  // Process all mappings
  for (const mapping of ctx.template.mappings) {
    const value = resolveVariableValue(ctx.theme, kind, mapping.variableId);
    
    if (!value) {
      continue; // Skip if variable value not set
    }

    if (mapping.catalogTarget === "colors") {
      colors[mapping.catalogKey] = value;
    } else if (mapping.catalogTarget === "semanticTokens") {
      semanticTokenColors[mapping.catalogKey] = value;
    } else if (mapping.catalogTarget === "textMateScopes") {
      // TextMate scopes go into tokenColors array
      tokenColors.push({
        scope: mapping.catalogKey,
        settings: {
          foreground: value,
        },
      });
    }
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
    const darkValue = resolveVariableValue(ctx.theme, "dark", colorVar.id);
    if (!darkValue) {
      issues.push({
        variableId: colorVar.id,
        message: `Color variable "${colorVar.name}" missing dark value`,
      });
    }

    const lightValue = resolveVariableValue(ctx.theme, "light", colorVar.id);
    if (!lightValue) {
      issues.push({
        variableId: colorVar.id,
        message: `Color variable "${colorVar.name}" missing light value`,
      });
    }
  }

  // Check all contrast variables have values
  for (const contrastVar of ctx.template.variables.contrast) {
    const darkValue = resolveVariableValue(ctx.theme, "dark", contrastVar.id);
    if (!darkValue) {
      issues.push({
        variableId: contrastVar.id,
        message: `Contrast variable "${contrastVar.name}" missing dark value`,
      });
    }

    const lightValue = resolveVariableValue(ctx.theme, "light", contrastVar.id);
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
  
  // Collect all keys from all catalogs
  for (const [catalogName, catalog] of ctx.catalogs) {
    const keys = getCatalogKeys(catalog, target);
    for (const key of keys) {
      allKeys.push({ catalogName, key });
    }
  }
  
  const mappedKeySet = new Set(
    ctx.template.mappings
      .filter((m) => m.catalogTarget === target)
      .map((m) => `${m.catalogName}:${m.catalogKey}`)
  );

  const unmappedKeys = allKeys.filter((item) => !mappedKeySet.has(`${item.catalogName}:${item.key}`));

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
      varUsage.mappedKeys.push(mapping.catalogKey);
    }
  }

  return Array.from(usage.values());
}
