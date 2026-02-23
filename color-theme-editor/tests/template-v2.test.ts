import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { loadTemplate, saveTemplate } from "../src/core/template-v2";
import type { Template_v2 } from "../src/domain/types";

const createdDirs: string[] = [];

async function createStudioRoot(): Promise<string> {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "vayeate-template-v2-test-"));
  createdDirs.push(root);
  return root;
}

afterEach(async () => {
  await Promise.all(
    createdDirs.splice(0, createdDirs.length).map(async (dir) => {
      await fs.rm(dir, { recursive: true, force: true });
    }),
  );
});

describe("template-v2 merged migration", () => {
  it("backfills paired color mappings for vayeate-semantic-merged contrast mappings", async () => {
    const root = await createStudioRoot();
    const templatesDir = path.join(root, "templates");
    await fs.mkdir(templatesDir, { recursive: true });

    const mergedTemplate: Template_v2 = {
      schemaVersion: 2,
      id: "vayeate-semantic-merged",
      name: "Vayeate Semantic Merged",
      version: "1.0.0",
      locked: true,
      catalogRefs: ["vayeate_theme_keys@1.0.0"],
      variables: {
        color: [
          { id: "editor-background", name: "EditorBackground" },
          { id: "editor-foreground", name: "EditorForeground" },
          { id: "ui-foreground", name: "UiForeground" },
          { id: "syntax-highlight", name: "SyntaxHighlight" },
          { id: "comments", name: "Comments" },
          { id: "keywords", name: "Keywords" },
          { id: "strings", name: "Strings" },
        ],
        contrast: [],
      },
      mappings: [
        {
          editorKey: "editor.foreground",
          target: "colors",
          variableId: "contrast-ui-foreground",
          variableType: "contrast",
        },
        {
          editorKey: "keyword",
          target: "semanticTokens",
          variableId: "contrast-keyword",
          variableType: "contrast",
        },
      ],
    };

    const templatePath = path.join(templatesDir, "vayeate-semantic-merged.v1.0.0.template.json");
    await fs.writeFile(templatePath, JSON.stringify(mergedTemplate, null, 2), "utf8");

    const loaded = await loadTemplate(root, "vayeate-semantic-merged@1.0.0");
    expect(loaded).not.toBeNull();

    const editorMappings = loaded!.mappings.filter(
      (mapping) => mapping.target === "colors" && mapping.editorKey === "editor.foreground",
    );
    expect(editorMappings.some((mapping) => mapping.variableType === "color")).toBe(true);
    expect(editorMappings.some((mapping) => mapping.variableType === "contrast")).toBe(true);

    const semanticMappings = loaded!.mappings.filter(
      (mapping) => mapping.target === "semanticTokens" && mapping.editorKey === "keyword",
    );
    expect(semanticMappings.some((mapping) => mapping.variableType === "color")).toBe(true);
    expect(semanticMappings.some((mapping) => mapping.variableType === "contrast")).toBe(true);

    const contrastVariableIds = new Set(loaded!.variables.contrast.map((variable) => variable.id));
    expect(contrastVariableIds.has("contrast-ui-foreground")).toBe(true);
    expect(contrastVariableIds.has("contrast-keyword")).toBe(true);
    expect(contrastVariableIds.has("contrast-default")).toBe(true);
  });

  it("persists migrated mappings when saved after load", async () => {
    const root = await createStudioRoot();
    const templatesDir = path.join(root, "templates");
    await fs.mkdir(templatesDir, { recursive: true });

    const mergedTemplate: Template_v2 = {
      schemaVersion: 2,
      id: "vayeate-semantic-merged",
      name: "Vayeate Semantic Merged",
      version: "1.0.0",
      locked: true,
      catalogRefs: ["vayeate_theme_keys@1.0.0"],
      variables: {
        color: [
          { id: "editor-background", name: "EditorBackground" },
          { id: "editor-foreground", name: "EditorForeground" },
          { id: "ui-foreground", name: "UiForeground" },
          { id: "syntax-highlight", name: "SyntaxHighlight" },
          { id: "comments", name: "Comments" },
          { id: "keywords", name: "Keywords" },
          { id: "strings", name: "Strings" },
        ],
        contrast: [],
      },
      mappings: [
        {
          editorKey: "editor.foreground",
          target: "colors",
          variableId: "contrast-ui-foreground",
          variableType: "contrast",
        },
      ],
    };

    const templatePath = path.join(templatesDir, "vayeate-semantic-merged.v1.0.0.template.json");
    await fs.writeFile(templatePath, JSON.stringify(mergedTemplate, null, 2), "utf8");

    const loaded = await loadTemplate(root, "vayeate-semantic-merged@1.0.0");
    expect(loaded).not.toBeNull();
    await saveTemplate(root, loaded!);

    const persisted = JSON.parse(await fs.readFile(templatePath, "utf8")) as Template_v2;
    const persistedMappings = persisted.mappings.filter(
      (mapping) => mapping.target === "colors" && mapping.editorKey === "editor.foreground",
    );

    expect(persistedMappings.some((mapping) => mapping.variableType === "color")).toBe(true);
    expect(persistedMappings.some((mapping) => mapping.variableType === "contrast")).toBe(true);

    const persistedContrastIds = new Set(persisted.variables.contrast.map((variable) => variable.id));
    expect(persistedContrastIds.has("contrast-ui-foreground")).toBe(true);
    expect(persistedContrastIds.has("contrast-default")).toBe(true);
  });
});
