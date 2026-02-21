import { promises as fs } from "node:fs";
import path from "node:path";
import type { GeneratedThemePair, ThemeTemplate } from "../domain/types";
import { stableStringify } from "./json";

const THEME_FILE_PATTERN = /^[a-z0-9-]+(?:-light)?-color-theme\.json$/;

export function assertValidThemeFileName(fileName: string): void {
  if (!THEME_FILE_PATTERN.test(fileName)) {
    throw new Error(`Invalid theme output filename: ${fileName}`);
  }
}

export function resolveOutputDirectory(projectRoot: string, outputDir: string): string {
  const resolved = path.resolve(projectRoot, outputDir);
  return resolved;
}

async function writeAtomic(targetPath: string, content: string): Promise<void> {
  const tempPath = `${targetPath}.tmp`;
  await fs.writeFile(tempPath, content, "utf8");
  await fs.rename(tempPath, targetPath);
}

export async function exportThemePair(
  projectRoot: string,
  template: ThemeTemplate,
  generated: GeneratedThemePair,
): Promise<{ darkPath: string; lightPath: string }> {
  assertValidThemeFileName(template.output.darkFileName);
  assertValidThemeFileName(template.output.lightFileName);

  const outputDir = resolveOutputDirectory(projectRoot, template.output.outputDir);
  await fs.mkdir(outputDir, { recursive: true });

  const darkPath = path.join(outputDir, template.output.darkFileName);
  const lightPath = path.join(outputDir, template.output.lightFileName);

  await writeAtomic(darkPath, stableStringify(generated.dark));
  await writeAtomic(lightPath, stableStringify(generated.light));

  return { darkPath, lightPath };
}