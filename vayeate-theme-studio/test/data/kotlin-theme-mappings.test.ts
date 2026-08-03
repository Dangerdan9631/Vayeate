import { readFile, readdir } from "node:fs/promises";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const studioRoot = resolve(import.meta.dirname, "../..");
const repositoryRoot = resolve(studioRoot, "..");

const expectedTextMateMappings = {
  "comment.block.documentation.kotlin": "EditorDocText",
  "entity.name.function.kotlin": "EditorMethod",
  "entity.name.type.kotlin": "EditorTypeClass",
  "keyword.control.kotlin": "EditorKeyword",
  "storage.type.kotlin": "EditorTypeClass",
  "string.quoted.double.kotlin": "EditorString",
  "variable.other.readwrite.kotlin": "EditorField",
} as const;

const expectedSemanticMappings = {
  "class:kotlin": "EditorTypeClass",
  "enumMember:kotlin": "EditorConstant",
  "function:kotlin": "EditorMethod",
  "interface:kotlin": "EditorTypeInterface",
  "method:kotlin": "EditorMethod",
  "parameter:kotlin": "EditorPreprocessor",
  "property:kotlin": "EditorField",
  "type:kotlin": "EditorTypeClass",
  "typeParameter:kotlin": "EditorPreprocessor",
  "variable:kotlin": "EditorField",
} as const;

const readJson = async (path: string) => JSON.parse(await readFile(path, "utf8"));

describe("Kotlin theme mappings", () => {
  it("keeps Kotlin TextMate and semantic selectors in the Vayeate template", async () => {
    const template = await readJson(resolve(studioRoot, "data/templates/vayeate-1.0.17.template.json"));
    const mappings = new Map(
      template.mappings.map(({ token, colorVariableRef }: { token: { key: string; type: string }; colorVariableRef: string }) => [
        `${token.type}|${token.key}`,
        colorVariableRef,
      ]),
    );

    for (const [scope, variable] of Object.entries(expectedTextMateMappings)) {
      expect(mappings.get(`textmate token|${scope}`)).toBe(variable);
    }
    for (const [selector, variable] of Object.entries(expectedSemanticMappings)) {
      expect(mappings.get(`semantic token|${selector}`)).toBe(variable);
    }
  });

  it("exports every bundled theme with Kotlin-specific colors", async () => {
    const themeDirectory = resolve(repositoryRoot, "themes");
    const themeFiles = (await readdir(themeDirectory)).filter((file) => file.endsWith("-color-theme.json"));
    expect(themeFiles).toHaveLength(34);

    for (const themeFile of themeFiles) {
      const theme = await readJson(resolve(themeDirectory, themeFile));
      const rulesByName = new Map<string, { scopes: Set<string>; settings: { foreground: string } }>(
        theme.tokenColors.map(({ name, scope, settings }: { name: string; scope: string[]; settings: { foreground: string } }) => [
          name,
          { scopes: new Set(Array.isArray(scope) ? scope : [scope]), settings },
        ]),
      );

      for (const [scope, variable] of Object.entries(expectedTextMateMappings)) {
        expect(rulesByName.get(variable)?.scopes.has(scope), `${themeFile}: ${scope}`).toBe(true);
      }
      for (const [selector, variable] of Object.entries(expectedSemanticMappings)) {
        expect(theme.semanticTokenColors[selector], `${themeFile}: ${selector}`).toEqual(rulesByName.get(variable)?.settings);
      }
    }
  });
});
