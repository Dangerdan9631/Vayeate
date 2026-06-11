import { singleton } from 'tsyringe';
import type { IRawGrammar } from 'vscode-textmate';
import onigWasmUrl from 'vscode-oniguruma/release/onig.wasm?url';
import type { TokenizedPreview } from '../../model/preview-types';
import { FileSystemService } from '../services/file-system-service';
import { TextmateTokenizerService } from '../services/textmate-tokenizer-service';

/**
 * Builds a WASM loader for Oniguruma in the Electron renderer (bundled by Vite).
 *
 * @returns Async function that fetches the bundled `onig.wasm` bytes.
 */
function createPreviewOnigWasmLoader(): () => Promise<ArrayBuffer> {
  return () => fetch(onigWasmUrl).then((r) => r.arrayBuffer());
}

/**
 * Package-relative root for bundled language preview samples.
 */
const PREVIEWS_RELATIVE_DIR = 'previews';

/**
 * Matches TextMate grammar JSON files within a language preview folder.
 */
const GRAMMAR_GLOB = /.+\.tmLanguage\.json$/i;

/**
 * Loads and tokenizes bundled preview samples for the theme editor.
 */
@singleton()
export class PreviewGateway {
  constructor(
    private readonly fileSystemService: FileSystemService,
    private readonly textmateTokenizerService: TextmateTokenizerService,
  ) {}

  /**
   * Scans `previews/<language>/`, tokenizes sample files, and returns structured previews.
   *
   * @returns Tokenized previews for each language and example file, or an empty list on failure.
   */
  async loadPreviews(): Promise<TokenizedPreview[]> {
    await this.textmateTokenizerService.init({ loadWasm: createPreviewOnigWasmLoader() });

    let topEntries: Array<{ name: string; isDirectory: boolean }>;
    try {
      topEntries = await this.fileSystemService.listDirEntries(PREVIEWS_RELATIVE_DIR);
    } catch {
      return [];
    }

    const langDirs = topEntries.filter((e) => e.isDirectory).map((e) => e.name);

    const langPreviews = await Promise.all(
      langDirs.map(async (lang) => this.loadLanguagePreviews(lang)),
    );

    return langPreviews.flat();
  }

  /**
   * Loads grammar and example files for one language folder under `previews/`.
   *
   * @param lang - Language subdirectory name.
   * @returns Tokenized previews for that language's example files.
   */
  private async loadLanguagePreviews(lang: string): Promise<TokenizedPreview[]> {
    const langRel = `${PREVIEWS_RELATIVE_DIR}/${lang}`;
    let files: string[];
    try {
      files = await this.fileSystemService.listFiles(langRel);
    } catch {
      return [];
    }

    const grammarFile = files.find((f) => GRAMMAR_GLOB.test(f));
    if (!grammarFile) return [];

    const grammarRel = `${langRel}/${grammarFile}`;
    let rawGrammar: IRawGrammar;
    try {
      const grammarText = await this.fileSystemService.loadFile(grammarRel);
      if (grammarText === null) return [];
      rawGrammar = JSON.parse(grammarText) as IRawGrammar;
    } catch {
      return [];
    }

    if (!rawGrammar.scopeName) return [];

    const exampleFiles = files.filter((f) => !GRAMMAR_GLOB.test(f) && !f.startsWith('.'));

    const examplePreviews = await Promise.all(
      exampleFiles.map(async (fileName) => {
        const fileRel = `${langRel}/${fileName}`;
        try {
          const sourceCode = await this.fileSystemService.loadFile(fileRel);
          if (sourceCode === null) return null;
          const lines = await this.textmateTokenizerService.tokenizeFile(rawGrammar, sourceCode);
          return { language: lang, fileName, lines };
        } catch {
          return null;
        }
      }),
    );

    return examplePreviews.filter((preview): preview is TokenizedPreview => preview != null);
  }
}
