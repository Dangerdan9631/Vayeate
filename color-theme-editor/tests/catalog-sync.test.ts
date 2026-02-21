import { describe, expect, it } from "vitest";
import { validateCatalogSnapshot } from "../src/core/catalog-sync";

describe("validateCatalogSnapshot", () => {
  it("accepts a valid snapshot", () => {
    const report = validateCatalogSnapshot({
      schemaVersion: 1,
      pinnedVersion: "vscode-catalog-2026-02-21",
      generatedAt: "2026-02-21T00:00:00.000Z",
      colorKeys: ["editor.background", "editor.foreground", "panel.border"],
      semanticTokenKeys: ["comment", "string", "keyword"],
      textMateScopes: ["comment.line", "string.quoted"],
    });

    expect(report.valid).toBe(true);
    expect(report.issues).toHaveLength(0);
  });

  it("flags missing required editor keys", () => {
    const report = validateCatalogSnapshot({
      schemaVersion: 1,
      pinnedVersion: "vscode-catalog-2026-02-21",
      generatedAt: "2026-02-21T00:00:00.000Z",
      colorKeys: ["panel.border"],
      semanticTokenKeys: ["comment"],
      textMateScopes: ["comment.line"],
    });

    expect(report.valid).toBe(false);
    expect(report.issues.some((issue) => issue.code === "MISSING_EDITOR_BACKGROUND")).toBe(true);
    expect(report.issues.some((issue) => issue.code === "MISSING_EDITOR_FOREGROUND")).toBe(true);
  });

  it("flags invalid formatting and duplicate entries", () => {
    const report = validateCatalogSnapshot({
      schemaVersion: 1,
      pinnedVersion: "vscode-catalog-2026-02-21",
      generatedAt: "2026-02-21T00:00:00.000Z",
      colorKeys: ["editor.background", "editor.foreground", "bad key", "editor.background"],
      semanticTokenKeys: [],
      textMateScopes: ["scope.one", "scope.one"],
    });

    expect(report.valid).toBe(false);
    expect(report.issues.some((issue) => issue.code === "INVALID_COLOR_KEY_FORMAT")).toBe(true);
    expect(report.issues.some((issue) => issue.code === "DUPLICATE_ENTRIES")).toBe(true);
  });
});