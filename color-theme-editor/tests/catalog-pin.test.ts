import { describe, expect, it } from "vitest";
import { validateCatalogPin } from "../src/core/catalog-sync";
import type { CatalogPin } from "../src/domain/types";

function createValidPin(): CatalogPin {
  return {
    schemaVersion: 1,
    pinnedVersion: "vscode-catalog-2026-02-21",
    updatePolicy: "manual",
    sources: {
      themeColorRegistryUrl: "https://code.visualstudio.com/api/references/theme-color",
      semanticTokenRegistryUrl:
        "https://code.visualstudio.com/api/language-extensions/semantic-highlight-guide#standard-token-types-and-modifiers",
      scopeGuidanceUrl: "https://macromates.com/manual/en/scope_selectors",
    },
  };
}

describe("validateCatalogPin", () => {
  it("accepts a valid pin", () => {
    expect(() => validateCatalogPin(createValidPin())).not.toThrow();
  });

  it("rejects invalid updatePolicy", () => {
    const pin = createValidPin();
    (pin as unknown as { updatePolicy: string }).updatePolicy = "auto";
    expect(() => validateCatalogPin(pin)).toThrow();
  });

  it("rejects non-http source URLs", () => {
    const pin = createValidPin();
    pin.sources.scopeGuidanceUrl = "file:///not-allowed";
    expect(() => validateCatalogPin(pin)).toThrow();
  });
});