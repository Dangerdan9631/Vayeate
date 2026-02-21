import { describe, expect, it } from "vitest";
import { validateCatalogSnapshot } from "../src/core/catalog-sync";

describe("validateCatalogSnapshot", () => {
  it("accepts a valid snapshot", () => {
    const snapshot = {
      schemaVersion: 1 as const,
      pinnedVersion: "vscode-catalog-2026-02-21",
      generatedAt: "2026-02-21T00:00:00.000Z",
      source: "merged" as const,
      colorKeys: ["editor.background", "editor.foreground", "panel.border"],
      semanticTokenKeys: ["comment", "string", "keyword"],
      textMateScopes: ["comment.line", "string.quoted"],
    };

    const report = validateCatalogSnapshot(snapshot, {
      localSnapshot: snapshot,
      remoteSnapshot: {
        schemaVersion: 1,
        pinnedVersion: "vscode-catalog-2026-02-21",
        fetchedAt: "2026-02-21T00:00:00.000Z",
        sourceUrls: {
          themeColorRegistryUrl: "https://example.test/theme-color",
          semanticTokenRegistryUrl: "https://example.test/semantic",
          scopeGuidanceUrl: "https://example.test/scopes",
        },
        colorKeys: [...snapshot.colorKeys],
        semanticTokenKeys: [...snapshot.semanticTokenKeys],
        textMateScopes: [...snapshot.textMateScopes],
      },
    });

    expect(report.valid).toBe(true);
    expect(report.issues).toHaveLength(0);
  });

  it("flags missing required editor keys", () => {
    const report = validateCatalogSnapshot({
      schemaVersion: 1 as const,
      pinnedVersion: "vscode-catalog-2026-02-21",
      generatedAt: "2026-02-21T00:00:00.000Z",
      source: "local",
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
      schemaVersion: 1 as const,
      pinnedVersion: "vscode-catalog-2026-02-21",
      generatedAt: "2026-02-21T00:00:00.000Z",
      source: "local",
      colorKeys: ["editor.background", "editor.foreground", "bad key", "editor.background"],
      semanticTokenKeys: [],
      textMateScopes: ["scope.one", "scope.one"],
    });

    expect(report.valid).toBe(false);
    expect(report.issues.some((issue) => issue.code === "INVALID_COLOR_KEY_FORMAT")).toBe(true);
    expect(report.issues.some((issue) => issue.code === "DUPLICATE_ENTRIES")).toBe(true);
  });

  it("adds remote drift warnings when remote catalog differs", () => {
    const localSnapshot = {
      schemaVersion: 1 as const,
      pinnedVersion: "vscode-catalog-2026-02-21",
      generatedAt: "2026-02-21T00:00:00.000Z",
      source: "local" as const,
      colorKeys: ["editor.background", "editor.foreground", "panel.border"],
      semanticTokenKeys: ["comment"],
      textMateScopes: ["comment.line"],
    };

    const mergedSnapshot = {
      ...localSnapshot,
      source: "merged" as const,
      colorKeys: [...localSnapshot.colorKeys, "menu.background"],
      semanticTokenKeys: [...localSnapshot.semanticTokenKeys, "string"],
      textMateScopes: [...localSnapshot.textMateScopes, "string.quoted"],
    };

    const report = validateCatalogSnapshot(mergedSnapshot, {
      localSnapshot,
      remoteSnapshot: {
        schemaVersion: 1,
        pinnedVersion: "vscode-catalog-2026-02-21",
        fetchedAt: "2026-02-21T00:00:00.000Z",
        sourceUrls: {
          themeColorRegistryUrl: "https://example.test/theme-color",
          semanticTokenRegistryUrl: "https://example.test/semantic",
          scopeGuidanceUrl: "https://example.test/scopes",
        },
        colorKeys: ["editor.background", "editor.foreground", "menu.background"],
        semanticTokenKeys: ["comment", "string"],
        textMateScopes: ["comment.line", "string.quoted"],
      },
    });

    expect(report.issues.some((issue) => issue.code === "REMOTE_DRIFT_DETECTED")).toBe(true);
    expect(report.issues.some((issue) => issue.code === "LOCAL_EXTENSIONS_PRESENT")).toBe(true);
    expect(report.stats.remoteOnlyColorKeys).toBe(1);
    expect(report.stats.localOnlyColorKeys).toBe(1);
  });
});