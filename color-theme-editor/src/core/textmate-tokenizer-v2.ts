import { promises as fs } from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import textmate from "vscode-textmate";
import type { IRawGrammar, StateStack } from "vscode-textmate";
import oniguruma from "vscode-oniguruma";
import type { PreviewSourceLanguage, PreviewTokenSpan, PreviewTokenizedLanguageBatch, PreviewTokenizedLine, PreviewTokenizedSample } from "../domain/types";
import { previewPathFor } from "./preview-source-v2";

interface TokenizerRuntime {
  grammar: IRawGrammar;
  registry: textmate.Registry;
}

const runtimeCache = new Map<string, Promise<TokenizerRuntime>>();
let onigurumaReady: Promise<void> | null = null;

function toLineSpans(line: string, tokens: Array<{ startIndex: number; endIndex: number; scopes: string[] }>): PreviewTokenSpan[] {
  if (tokens.length === 0) {
    return [{ startIndex: 0, endIndex: line.length, text: line, scopes: [] }];
  }

  const spans: PreviewTokenSpan[] = [];
  let cursor = 0;

  for (const token of tokens) {
    const start = Math.max(cursor, token.startIndex);
    const end = Math.max(start, Math.min(line.length, token.endIndex));

    if (start > cursor) {
      spans.push({
        startIndex: cursor,
        endIndex: start,
        text: line.slice(cursor, start),
        scopes: [],
      });
    }

    spans.push({
      startIndex: start,
      endIndex: end,
      text: line.slice(start, end),
      scopes: token.scopes,
    });

    cursor = end;
  }

  if (cursor < line.length) {
    spans.push({
      startIndex: cursor,
      endIndex: line.length,
      text: line.slice(cursor),
      scopes: [],
    });
  }

  return spans.length > 0 ? spans : [{ startIndex: 0, endIndex: line.length, text: line, scopes: [] }];
}

async function ensureOniguruma(): Promise<void> {
  if (!onigurumaReady) {
    const require = createRequire(import.meta.url);
    const wasmPath = require.resolve("vscode-oniguruma/release/onig.wasm");
    onigurumaReady = fs.readFile(wasmPath).then((bytes) => oniguruma.loadWASM(bytes.buffer));
  }
  await onigurumaReady;
}

async function loadRuntime(studioRoot: string, language: PreviewSourceLanguage): Promise<TokenizerRuntime> {
  const grammarPath = previewPathFor(studioRoot, language.grammarRelativePath);
  const cacheKey = `${language.id}:${grammarPath}`;
  const cached = runtimeCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const runtimePromise = (async () => {
    await ensureOniguruma();

    const rawGrammarContent = await fs.readFile(grammarPath, "utf8");
    const grammar = textmate.parseRawGrammar(rawGrammarContent, grammarPath);
    if (!grammar.scopeName) {
      throw new Error(`Grammar at ${language.grammarRelativePath} is missing scopeName`);
    }

    const registry = new textmate.Registry({
      onigLib: Promise.resolve({
        createOnigScanner: (sources) => new oniguruma.OnigScanner(sources),
        createOnigString: (content) => new oniguruma.OnigString(content),
      }),
      loadGrammar: async (scopeName) => (scopeName === grammar.scopeName ? grammar : null),
    });

    return { grammar, registry };
  })();

  runtimeCache.set(cacheKey, runtimePromise);
  return runtimePromise;
}

async function tokenizeSample(
  studioRoot: string,
  language: PreviewSourceLanguage,
  sampleId: string,
  sampleRelativePath: string,
): Promise<PreviewTokenizedSample> {
  const runtime = await loadRuntime(studioRoot, language);
  const grammar = await runtime.registry.loadGrammar(runtime.grammar.scopeName);
  if (!grammar) {
    throw new Error(`Unable to load grammar scope ${runtime.grammar.scopeName}`);
  }

  const samplePath = previewPathFor(studioRoot, sampleRelativePath);
  const content = await fs.readFile(samplePath, "utf8");
  const rawLines = content.split(/\r?\n/);

  let state: StateStack | null = null;
  const lines: PreviewTokenizedLine[] = rawLines.map((line, lineIndex) => {
    const result = grammar.tokenizeLine(line, state);
    state = result.ruleStack;

    return {
      lineNumber: lineIndex + 1,
      text: line,
      spans: toLineSpans(line, result.tokens),
    };
  });

  return {
    sampleId,
    languageId: language.id,
    relativePath: sampleRelativePath,
    lines,
  };
}

export interface TokenizePreviewRequest {
  languageIds?: string[];
  sampleIdsByLanguage?: Record<string, string[]>;
}

export async function tokenizePreviewSources(
  studioRoot: string,
  sources: PreviewSourceLanguage[],
  request: TokenizePreviewRequest = {},
): Promise<PreviewTokenizedLanguageBatch[]> {
  const selectedLanguageIds = request.languageIds ? new Set(request.languageIds) : null;
  const output: PreviewTokenizedLanguageBatch[] = [];

  for (const language of sources) {
    if (selectedLanguageIds && !selectedLanguageIds.has(language.id)) {
      continue;
    }

    const requestedSampleIds = request.sampleIdsByLanguage?.[language.id];
    const selectedSampleIds = requestedSampleIds ? new Set(requestedSampleIds) : null;
    const selectedSamples = language.samples.filter((sample) => !selectedSampleIds || selectedSampleIds.has(sample.id));

    const samples: PreviewTokenizedSample[] = [];
    for (const sample of selectedSamples) {
      samples.push(await tokenizeSample(studioRoot, language, sample.id, sample.relativePath));
    }

    output.push({
      languageId: language.id,
      samples,
    });
  }

  return output;
}
