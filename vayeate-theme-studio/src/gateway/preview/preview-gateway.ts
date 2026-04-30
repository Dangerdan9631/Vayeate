import { singleton } from 'tsyringe';
import type { IRawGrammar } from 'vscode-textmate';
import onigWasmUrl from 'vscode-oniguruma/release/onig.wasm?url';
import type { TokenizedPreview } from '../../model/preview-types';
import { FileSystemService } from '../services/file-system-service';
import { TextmateTokenizerService } from '../services/textmate-tokenizer-service';

/** WASM loader for {@link initOniguruma} in the Electron renderer (bundled by Vite). */
function createPreviewOnigWasmLoader(): () => Promise<ArrayBuffer> {
  return () => fetch(onigWasmUrl).then((r) => r.arrayBuffer());
}

const PREVIEWS_RELATIVE_DIR = 'previews';

const GRAMMAR_GLOB = /.+\.tmLanguage\.json$/i;

@singleton()
export class PreviewGateway {
  constructor(
    private readonly fileSystemService: FileSystemService,
    private readonly textmateTokenizerService: TextmateTokenizerService,
  ) {}

  /**
   * Scan `previews/<language>/`, load each `*.tmLanguage.json` grammar and sample files,
   * tokenize with TextMate, and return structured previews for the theme editor.
   */
  async loadPreviews(): Promise<TokenizedPreview[]> {
    await this.textmateTokenizerService.init({ loadWasm: createPreviewOnigWasmLoader() });

    const results: TokenizedPreview[] = [];

    let topEntries: Array<{ name: string; isDirectory: boolean }>;
    try {
      topEntries = await this.fileSystemService.listDirEntries(PREVIEWS_RELATIVE_DIR);
    } catch {
      return results;
    }

    const langDirs = topEntries.filter((e) => e.isDirectory).map((e) => e.name);

    for (const lang of langDirs) {
      const langRel = `${PREVIEWS_RELATIVE_DIR}/${lang}`;
      let files: string[];
      try {
        files = await this.fileSystemService.listFiles(langRel);
      } catch {
        continue;
      }

      const grammarFile = files.find((f) => GRAMMAR_GLOB.test(f));
      if (!grammarFile) continue;

      const grammarRel = `${langRel}/${grammarFile}`;
      let rawGrammar: IRawGrammar;
      try {
        const grammarText = await this.fileSystemService.loadFile(grammarRel);
        if (grammarText === null) continue;
        rawGrammar = JSON.parse(grammarText) as IRawGrammar;
      } catch {
        continue;
      }

      if (!rawGrammar.scopeName) continue;

      const exampleFiles = files.filter((f) => !GRAMMAR_GLOB.test(f) && !f.startsWith('.'));

      for (const fileName of exampleFiles) {
        const fileRel = `${langRel}/${fileName}`;
        try {
          const sourceCode = await this.fileSystemService.loadFile(fileRel);
          if (sourceCode === null) continue;
          const lines = await this.textmateTokenizerService.tokenizeFile(rawGrammar, sourceCode);
          results.push({ language: lang, fileName, lines });
        } catch {
          // skip files that fail to tokenize
        }
      }
    }

    return results;
  }
}
