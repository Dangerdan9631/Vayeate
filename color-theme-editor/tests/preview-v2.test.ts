import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import type { GeneratedTheme, PreviewSourceLanguage, PreviewTokenizedLanguageBatch, Theme } from "../src/domain/types";
import { discoverPreviewSources, PreviewSourceContractError } from "../src/core/preview-source-v2";
import { tokenizePreviewSources } from "../src/core/textmate-tokenizer-v2";
import { resolveScopeForeground } from "../src/ui/preview/PreviewPane";
import { loadTheme, saveTheme } from "../src/core/theme-v2";
import { flattenTokenizedPreviewSamples, getAlwaysOnPreviewVariants } from "../src/ui/ThemeTabV2";

const createdDirs: string[] = [];

const BASIC_TS_GRAMMAR = `{
  "scopeName": "source.ts",
  "name": "TypeScript Test Grammar",
  "patterns": [
    { "include": "#comments" },
    { "include": "#strings" },
    { "include": "#keywords" }
  ],
  "repository": {
    "comments": {
      "patterns": [{ "name": "comment.line.double-slash.ts", "match": "//.*$" }]
    },
    "strings": {
      "patterns": [{ "name": "string.quoted.double.ts", "begin": "\\\"", "end": "\\\"" }]
    },
    "keywords": {
      "patterns": [{ "name": "keyword.control.ts", "match": "\\b(const|return|if|else)\\b" }]
    }
  }
}`;

async function createStudioRoot(): Promise<string> {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "vayeate-preview-test-"));
  createdDirs.push(root);
  return root;
}

async function writePreviewLanguage(
  studioRoot: string,
  languageId: string,
  files: Record<string, string>,
): Promise<void> {
  const dir = path.join(studioRoot, "previews", languageId);
  await fs.mkdir(dir, { recursive: true });

  for (const [name, content] of Object.entries(files)) {
    await fs.writeFile(path.join(dir, name), content, "utf8");
  }
}

afterEach(async () => {
  await Promise.all(
    createdDirs.splice(0, createdDirs.length).map(async (dir) => {
      await fs.rm(dir, { recursive: true, force: true });
    }),
  );
});

describe("preview source discovery", () => {
  it("validates one grammar file per language", async () => {
    const root = await createStudioRoot();
    await writePreviewLanguage(root, "typescript", {
      "A.tmLanguage.json": BASIC_TS_GRAMMAR,
      "B.tmLanguage.json": BASIC_TS_GRAMMAR,
      "sample.ts": "const value = 1;",
    });

    await expect(discoverPreviewSources(root)).rejects.toBeInstanceOf(PreviewSourceContractError);
  });

  it("returns deterministic language and sample ordering", async () => {
    const root = await createStudioRoot();
    await writePreviewLanguage(root, "z-lang", {
      "z.tmLanguage.json": BASIC_TS_GRAMMAR,
      "b.ts": "const b = 1;",
      "a.ts": "const a = 2;",
    });
    await writePreviewLanguage(root, "a-lang", {
      "a.tmLanguage.json": BASIC_TS_GRAMMAR,
      "c.ts": "const c = 3;",
      "a.ts": "const a = 4;",
    });

    const languages = await discoverPreviewSources(root);
    expect(languages.map((language) => language.id)).toEqual(["a-lang", "z-lang"]);
    expect(languages[0].samples.map((sample) => sample.fileName)).toEqual(["a.ts", "c.ts"]);
    expect(languages[1].samples.map((sample) => sample.fileName)).toEqual(["a.ts", "b.ts"]);
  });
});

describe("preview tokenization", () => {
  it("produces stable TextMate token spans", async () => {
    const root = await createStudioRoot();
    await writePreviewLanguage(root, "typescript", {
      "TypeScript.tmLanguage.json": BASIC_TS_GRAMMAR,
      "sample.ts": "const text = \"hello\"; // note",
    });

    const languages = await discoverPreviewSources(root);
    const batches = await tokenizePreviewSources(root, languages);

    expect(batches[0].samples[0].lines[0].spans).toMatchInlineSnapshot(`
      [
        {
          "endIndex": 13,
          "scopes": [
            "source.ts",
          ],
          "startIndex": 0,
          "text": "const text = ",
        },
        {
          "endIndex": 14,
          "scopes": [
            "source.ts",
            "string.quoted.double.ts",
          ],
          "startIndex": 13,
          "text": "\"",
        },
        {
          "endIndex": 19,
          "scopes": [
            "source.ts",
            "string.quoted.double.ts",
          ],
          "startIndex": 14,
          "text": "hello",
        },
        {
          "endIndex": 20,
          "scopes": [
            "source.ts",
            "string.quoted.double.ts",
          ],
          "startIndex": 19,
          "text": "\"",
        },
        {
          "endIndex": 22,
          "scopes": [
            "source.ts",
          ],
          "startIndex": 20,
          "text": "; ",
        },
        {
          "endIndex": 29,
          "scopes": [
            "source.ts",
            "comment.line.double-slash.ts",
          ],
          "startIndex": 22,
          "text": "// note",
        },
      ]
    `);
  });
});

describe("preview token color fallback", () => {
  const baseTheme: GeneratedTheme = {
    name: "test",
    type: "dark",
    semanticHighlighting: true,
    colors: {
      "editor.background": "#1e1e1e",
      "editor.foreground": "#d4d4d4",
    },
    tokenColors: [],
    semanticTokenColors: {},
  };

  it("prefers token color matches for scopes", () => {
    const theme: GeneratedTheme = {
      ...baseTheme,
      tokenColors: [{ scope: "comment", settings: { foreground: "#00ff00" } }],
    };

    expect(resolveScopeForeground(theme, ["source.ts", "comment.line.double-slash.ts"])).toBe("#00ff00");
  });

  it("falls back to semantic token colors", () => {
    const theme: GeneratedTheme = {
      ...baseTheme,
      semanticTokenColors: { string: "#ff00ff" },
    };

    expect(resolveScopeForeground(theme, ["source.ts", "string.quoted.double.ts"])).toBe("#ff00ff");
  });

  it("falls back to editor foreground", () => {
    expect(resolveScopeForeground(baseTheme, ["source.ts", "meta.other.unknown"])).toBe("#d4d4d4");
  });
});

describe("theme preview metadata", () => {
  it("persists preview borderVariableId", async () => {
    const root = await createStudioRoot();
    const theme: Theme = {
      schemaVersion: 2,
      id: "preview-theme",
      name: "Preview Theme",
      templateRef: "template@1.0.0",
      values: {
        dark: [],
        light: [],
      },
      output: {
        darkFileName: "preview-dark.json",
        lightFileName: "preview-light.json",
        outputDir: "../themes",
      },
      preview: {
        borderVariableId: "frame-border",
      },
    };

    await saveTheme(root, theme);
    const loaded = await loadTheme(root, theme.id);

    expect(loaded?.preview?.borderVariableId).toBe("frame-border");
  });
});

describe("always-on preview behavior", () => {
  it("always includes dark and light variants", () => {
    expect(getAlwaysOnPreviewVariants()).toEqual(["dark", "light"]);
  });

  it("keeps all discovered samples in language order", () => {
    const languages: PreviewSourceLanguage[] = [
      {
        id: "alpha",
        label: "alpha",
        relativePath: "previews/alpha",
        grammarFileName: "alpha.tmLanguage.json",
        grammarRelativePath: "previews/alpha/alpha.tmLanguage.json",
        samples: [
          {
            id: "alpha:a.ts",
            fileName: "a.ts",
            label: "a.ts",
            languageId: "alpha",
            relativePath: "previews/alpha/a.ts",
          },
        ],
      },
      {
        id: "beta",
        label: "beta",
        relativePath: "previews/beta",
        grammarFileName: "beta.tmLanguage.json",
        grammarRelativePath: "previews/beta/beta.tmLanguage.json",
        samples: [
          {
            id: "beta:z.ts",
            fileName: "z.ts",
            label: "z.ts",
            languageId: "beta",
            relativePath: "previews/beta/z.ts",
          },
        ],
      },
    ];

    const batches: PreviewTokenizedLanguageBatch[] = [
      {
        languageId: "beta",
        samples: [
          {
            sampleId: "beta:z.ts",
            languageId: "beta",
            relativePath: "previews/beta/z.ts",
            lines: [{ lineNumber: 1, text: "beta", spans: [{ startIndex: 0, endIndex: 4, text: "beta", scopes: [] }] }],
          },
        ],
      },
      {
        languageId: "alpha",
        samples: [
          {
            sampleId: "alpha:a.ts",
            languageId: "alpha",
            relativePath: "previews/alpha/a.ts",
            lines: [{ lineNumber: 1, text: "alpha", spans: [{ startIndex: 0, endIndex: 5, text: "alpha", scopes: [] }] }],
          },
        ],
      },
    ];

    const flattened = flattenTokenizedPreviewSamples(languages, batches);
    expect(flattened.map((sample) => sample.sampleId)).toEqual(["alpha:a.ts", "beta:z.ts"]);
  });
});
