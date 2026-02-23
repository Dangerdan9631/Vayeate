import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { loadCatalogsByName } from "../src/core/catalog-v2";
import { generateThemeOutput } from "../src/core/generator-v2";
import { loadTemplate } from "../src/core/template-v2";
import { loadTheme } from "../src/core/theme-v2";

const currentFilePath = fileURLToPath(import.meta.url);
const studioRoot = path.resolve(path.dirname(currentFilePath), "..");

describe("v2 merged template migration integration", () => {
  it("generates hex theme colors for merged template without emitting contrast literals", async () => {
    const theme = await loadTheme(studioRoot, "vayeate-semantic-merged-vayeate");
    expect(theme).not.toBeNull();

    const template = await loadTemplate(studioRoot, theme!.templateRef);
    expect(template).not.toBeNull();

    const catalogs = await loadCatalogsByName(studioRoot, template!.catalogRefs);
    expect(catalogs.size).toBeGreaterThan(0);

    const output = generateThemeOutput({ catalogs, template: template!, theme: theme! });

    const allDarkColorValues = Object.values(output.dark.colors);
    expect(allDarkColorValues.length).toBeGreaterThan(0);
    for (const value of allDarkColorValues) {
      expect(value).toMatch(/^#[0-9a-f]{6}$/i);
    }

    const allLightColorValues = Object.values(output.light.colors);
    expect(allLightColorValues.length).toBeGreaterThan(0);
    for (const value of allLightColorValues) {
      expect(value).toMatch(/^#[0-9a-f]{6}$/i);
    }

    expect(output.dark.colors["editor.background"]).toMatch(/^#[0-9a-f]{6}$/i);
    expect(output.dark.colors["editor.foreground"]).toMatch(/^#[0-9a-f]{6}$/i);
  });
});
