import { promises as fs } from "node:fs";
import path from "node:path";
import type {
  Theme,
  ThemeVariableAssignment,
  ColorHex,
  ThemeVariableValue,
  ThemeKind,
} from "../domain/types";

const THEMES_DIR = "themes-config";

export async function loadTheme(studioRoot: string, themeId: string): Promise<Theme | null> {
  const themePath = path.join(studioRoot, THEMES_DIR, `${themeId}.theme.json`);
  try {
    const content = await fs.readFile(themePath, "utf8");
    return JSON.parse(content) as Theme;
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message.includes("ENOENT")) {
      return null;
    }
    throw error;
  }
}

export async function saveTheme(studioRoot: string, theme: Theme): Promise<void> {
  const themesDir = path.join(studioRoot, THEMES_DIR);
  const themePath = path.join(themesDir, `${theme.id}.theme.json`);
  
  await fs.mkdir(themesDir, { recursive: true });
  await fs.writeFile(themePath, `${JSON.stringify(theme, null, 2)}\n`, "utf8");
}

export async function listThemes(studioRoot: string): Promise<string[]> {
  const themesDir = path.join(studioRoot, THEMES_DIR);
  try {
    const files = await fs.readdir(themesDir);
    return files
      .filter((file) => file.endsWith(".theme.json"))
      .map((file) => file.replace(".theme.json", ""));
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message.includes("ENOENT")) {
      return [];
    }
    throw error;
  }
}

export function createEmptyTheme(templateRef: string, name: string): Theme {
  return {
    schemaVersion: 2,
    id: generateThemeId(),
    name,
    templateRef,
    values: {
      dark: [],
      light: [],
    },
    output: {
      darkFileName: `${normalizeFileName(name)}-dark.json`,
      lightFileName: `${normalizeFileName(name)}-light.json`,
      outputDir: "../themes",
    },
  };
}

export function setVariableValue(
  theme: Theme,
  kind: ThemeKind,
  variableId: string,
  value: ThemeVariableValue
): Theme {
  const targetArray = kind === "dark" ? theme.values.dark : theme.values.light;
  const existingIndex = targetArray.findIndex((v) => v.variableId === variableId);
  
  let updatedArray: ThemeVariableAssignment[];
  if (existingIndex >= 0) {
    updatedArray = [...targetArray];
    updatedArray[existingIndex] = { variableId, value };
  } else {
    updatedArray = [...targetArray, { variableId, value }];
  }
  
  return {
    ...theme,
    values: {
      ...theme.values,
      [kind]: updatedArray,
    },
  };
}

export function getVariableValue(theme: Theme, kind: ThemeKind, variableId: string): ThemeVariableValue | null {
  const targetArray = kind === "dark" ? theme.values.dark : theme.values.light;
  const assignment = targetArray.find((v) => v.variableId === variableId);
  return assignment?.value ?? null;
}

export function resolveVariableValue(theme: Theme, kind: ThemeKind, variableId: string): ColorHex | null {
  if (kind === "dark") {
    const darkValue = getVariableValue(theme, "dark", variableId);
    return darkValue === "useDark" ? null : (darkValue as ColorHex | null);
  }
  
  const lightValue = getVariableValue(theme, "light", variableId);
  if (lightValue === "useDark") {
    const darkValue = getVariableValue(theme, "dark", variableId);
    return darkValue === "useDark" ? null : (darkValue as ColorHex | null);
  }
  
  return lightValue as ColorHex | null;
}

export function setLightToUseDark(theme: Theme, variableId: string): Theme {
  return setVariableValue(theme, "light", variableId, "useDark");
}

export function isLightUsingDark(theme: Theme, variableId: string): boolean {
  const lightValue = getVariableValue(theme, "light", variableId);
  return lightValue === "useDark";
}

export function clearVariableValue(theme: Theme, kind: ThemeKind, variableId: string): Theme {
  const targetArray = kind === "dark" ? theme.values.dark : theme.values.light;
  const updatedArray = targetArray.filter((v) => v.variableId !== variableId);
  
  return {
    ...theme,
    values: {
      ...theme.values,
      [kind]: updatedArray,
    },
  };
}

export function cloneTheme(theme: Theme, newName: string): Theme {
  return {
    ...theme,
    id: generateThemeId(),
    name: newName,
    output: {
      ...theme.output,
      darkFileName: `${normalizeFileName(newName)}-dark.json`,
      lightFileName: `${normalizeFileName(newName)}-light.json`,
    },
  };
}

export function updateThemeOutput(
  theme: Theme,
  field: "darkFileName" | "lightFileName" | "outputDir",
  value: string
): Theme {
  return {
    ...theme,
    output: {
      ...theme.output,
      [field]: value,
    },
  };
}

function generateThemeId(): string {
  return `theme-${Date.now()}`;
}

function normalizeFileName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export function getAllVariableIds(theme: Theme): string[] {
  const darkIds = theme.values.dark.map((v) => v.variableId);
  const lightIds = theme.values.light.map((v) => v.variableId);
  return Array.from(new Set([...darkIds, ...lightIds]));
}

export function getUnsetVariables(theme: Theme, kind: ThemeKind, allVariableIds: string[]): string[] {
  const setIds = new Set(
    (kind === "dark" ? theme.values.dark : theme.values.light).map((v) => v.variableId)
  );
  return allVariableIds.filter((id) => !setIds.has(id));
}
