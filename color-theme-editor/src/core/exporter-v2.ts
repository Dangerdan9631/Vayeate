import { promises as fs } from "node:fs";
import path from "node:path";
import type { Theme, GeneratedTheme } from "../domain/types";
import { stableStringify } from "./json";

export interface ExportResult {
  darkPath: string;
  lightPath: string;
  darkBytes: number;
  lightBytes: number;
}

export async function exportThemePair(
  studioRoot: string,
  theme: Theme,
  darkTheme: GeneratedTheme,
  lightTheme: GeneratedTheme
): Promise<ExportResult> {
  const outputDir = resolveOutputDirectory(studioRoot, theme.output.outputDir);
  await fs.mkdir(outputDir, { recursive: true });

  const darkPath = path.join(outputDir, theme.output.darkFileName);
  const lightPath = path.join(outputDir, theme.output.lightFileName);

  const darkContent = stableStringify(darkTheme);
  const lightContent = stableStringify(lightTheme);

  await fs.writeFile(darkPath, darkContent, "utf8");
  await fs.writeFile(lightPath, lightContent, "utf8");

  return {
    darkPath,
    lightPath,
    darkBytes: darkContent.length,
    lightBytes: lightContent.length,
  };
}

export function resolveOutputDirectory(studioRoot: string, outputDir: string): string {
  if (path.isAbsolute(outputDir)) {
    return outputDir;
  }
  return path.resolve(studioRoot, outputDir);
}

export interface ExportPreview {
  darkPath: string;
  lightPath: string;
  darkExists: boolean;
  lightExists: boolean;
  darkCurrentBytes: number;
  lightCurrentBytes: number;
  darkNewBytes: number;
  lightNewBytes: number;
  darkWillChange: boolean;
  lightWillChange: boolean;
}

export async function previewExport(
  studioRoot: string,
  theme: Theme,
  darkTheme: GeneratedTheme,
  lightTheme: GeneratedTheme
): Promise<ExportPreview> {
  const outputDir = resolveOutputDirectory(studioRoot, theme.output.outputDir);
  const darkPath = path.join(outputDir, theme.output.darkFileName);
  const lightPath = path.join(outputDir, theme.output.lightFileName);

  const darkContent = stableStringify(darkTheme);
  const lightContent = stableStringify(lightTheme);

  const darkCurrent = await readFileOrEmpty(darkPath);
  const lightCurrent = await readFileOrEmpty(lightPath);

  return {
    darkPath,
    lightPath,
    darkExists: darkCurrent.exists,
    lightExists: lightCurrent.exists,
    darkCurrentBytes: darkCurrent.content.length,
    lightCurrentBytes: lightCurrent.content.length,
    darkNewBytes: darkContent.length,
    lightNewBytes: lightContent.length,
    darkWillChange: !darkCurrent.exists || darkCurrent.content !== darkContent,
    lightWillChange: !lightCurrent.exists || lightCurrent.content !== lightContent,
  };
}

async function readFileOrEmpty(filePath: string): Promise<{ exists: boolean; content: string }> {
  try {
    const content = await fs.readFile(filePath, "utf8");
    return { exists: true, content };
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message.includes("ENOENT")) {
      return { exists: false, content: "" };
    }
    throw error;
  }
}
