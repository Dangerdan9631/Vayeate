import onigWasmUrl from 'vscode-oniguruma/release/onig.wasm?url';

/** WASM loader for {@link initOniguruma} in the Electron renderer (bundled by Vite). */
export function createPreviewOnigWasmLoader(): () => Promise<ArrayBuffer> {
  return () => fetch(onigWasmUrl).then((r) => r.arrayBuffer());
}
