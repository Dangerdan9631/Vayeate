/**
 * Main-process preview loader: scans previews directory, loads grammars and example files,
 * tokenizes with TextMate and returns TokenizedPreview[].
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { initOniguruma, tokenizeFile } from '../src/domain/utils/tokenizer';
import type { TokenizedPreview } from '../src/domain/utils/tokenizer';
import type { IRawGrammar } from 'vscode-textmate';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const GRAMMAR_GLOB = /.+\.tmLanguage\.json$/i;

/**
 * Resolve the previews directory. In dev (Vite) we're under project root; in production use same relative path.
 */
export function getPreviewsDir(appPath?: string): string {
  const base = appPath ?? path.join(__dirname, '..');
  return path.join(base, 'previews');
}

/**
 * Load all previews: scan previews dir for language subdirs, load grammar + example files, tokenize each.
 */
export async function loadAllPreviews(previewsDir: string): Promise<TokenizedPreview[]> {
  await initOniguruma();

  const results: TokenizedPreview[] = [];
  if (!fs.existsSync(previewsDir)) {
    return results;
  }

  const subdirs = fs.readdirSync(previewsDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  for (const lang of subdirs) {
    const langPath = path.join(previewsDir, lang);
    const files = fs.readdirSync(langPath);

    const grammarFile = files.find((f) => GRAMMAR_GLOB.test(f));
    if (!grammarFile) continue;

    const grammarPath = path.join(langPath, grammarFile);
    let rawGrammar: IRawGrammar;
    try {
      const content = fs.readFileSync(grammarPath, 'utf-8');
      rawGrammar = JSON.parse(content) as IRawGrammar;
    } catch {
      continue;
    }

    if (!rawGrammar.scopeName) continue;

    const exampleFiles = files.filter(
      (f) => !GRAMMAR_GLOB.test(f) && !f.startsWith('.'),
    );

    for (const fileName of exampleFiles) {
      const filePath = path.join(langPath, fileName);
      try {
        const sourceCode = fs.readFileSync(filePath, 'utf-8');
        const lines = await tokenizeFile(rawGrammar, sourceCode);
        results.push({ language: lang, fileName, lines });
      } catch {
        // skip files that fail to tokenize
      }
    }
  }

  return results;
}
