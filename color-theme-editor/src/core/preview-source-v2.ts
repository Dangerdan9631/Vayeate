import { promises as fs } from "node:fs";
import path from "node:path";
import type { PreviewSourceLanguage, PreviewSourceSample } from "../domain/types";

const PREVIEWS_DIR = "previews";
const GRAMMAR_FILE_PATTERN = /\.tmLanguage(?:\.json)?$|\.plist$/i;

export class PreviewSourceContractError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PreviewSourceContractError";
  }
}

function isHiddenName(name: string): boolean {
  return name.startsWith(".");
}

function toPosixPath(input: string): string {
  return input.split(path.sep).join("/");
}

function toSampleLabel(fileName: string): string {
  return fileName;
}

function assertWithinRoot(rootDir: string, candidatePath: string): void {
  const relative = path.relative(rootDir, candidatePath);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new PreviewSourceContractError(`Preview path escapes previews root: ${candidatePath}`);
  }
}

function toSample(languageId: string, fileName: string): PreviewSourceSample {
  return {
    id: `${languageId}:${fileName}`,
    fileName,
    label: toSampleLabel(fileName),
    languageId,
    relativePath: `previews/${languageId}/${fileName}`,
  };
}

export async function discoverPreviewSources(studioRoot: string): Promise<PreviewSourceLanguage[]> {
  const previewsRoot = path.join(studioRoot, PREVIEWS_DIR);

  let topLevelEntries: Array<{ isDirectory: () => boolean; name: string | Buffer }>;
  try {
    topLevelEntries = await fs.readdir(previewsRoot, { withFileTypes: true, encoding: "utf8" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message.includes("ENOENT")) {
      return [];
    }
    throw error;
  }

  const languageDirs = topLevelEntries
    .filter((entry) => entry.isDirectory() && !isHiddenName(String(entry.name)))
    .map((entry) => String(entry.name))
    .sort((left, right) => left.localeCompare(right));

  const languages: PreviewSourceLanguage[] = [];

  for (const languageId of languageDirs) {
    const languageDir = path.join(previewsRoot, languageId);
    assertWithinRoot(previewsRoot, languageDir);

    const entries = await fs.readdir(languageDir, { withFileTypes: true, encoding: "utf8" });
    const files = entries
      .filter((entry) => entry.isFile() && !isHiddenName(String(entry.name)))
      .map((entry) => String(entry.name))
      .sort((left, right) => left.localeCompare(right));

    const grammarFiles = files.filter((fileName) => GRAMMAR_FILE_PATTERN.test(fileName));
    if (grammarFiles.length !== 1) {
      throw new PreviewSourceContractError(
        `Expected exactly one grammar file in previews/${languageId}, found ${grammarFiles.length}`,
      );
    }

    const grammarFileName = grammarFiles[0];
    const sampleFiles = files.filter((fileName) => fileName !== grammarFileName);

    if (sampleFiles.length === 0) {
      throw new PreviewSourceContractError(`Expected at least one sample file in previews/${languageId}`);
    }

    const samples = sampleFiles.map((fileName) => toSample(languageId, fileName));
    const grammarRelativePath = toPosixPath(path.relative(studioRoot, path.join(languageDir, grammarFileName)));

    languages.push({
      id: languageId,
      label: languageId,
      relativePath: `previews/${languageId}`,
      grammarFileName,
      grammarRelativePath,
      samples,
    });
  }

  return languages;
}

export function previewPathFor(studioRoot: string, relativePath: string): string {
  const previewsRoot = path.join(studioRoot, PREVIEWS_DIR);
  const resolved = path.resolve(studioRoot, relativePath);
  assertWithinRoot(previewsRoot, resolved);
  return resolved;
}
