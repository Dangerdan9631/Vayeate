import type { ChildProcess } from 'node:child_process';
import type { Plugin } from 'vite';

type ProcessWithElectronApp = NodeJS.Process & { electronApp?: ChildProcess };

/**
 * Custom Vite plugin: tear down the dev server when the Electron child process exits.
 *
 * **What it does:** `vite-plugin-electron` spawns Electron and hooks `process.exit` when that child
 * dies, but on some setups the Vite process keeps running (zombie terminal) after you close the
 * app window. We listen for `exit` / `close` on `process.electronApp`, then `server.close()` and
 * `process.exit` so Node and the dev server actually stop. The polling interval re-attaches when
 * `electronApp` is replaced (main/preload rebuild / hot restart).
 *
 * **When it runs:** Dev only (`apply: 'serve'`). Production `vite build` does not load this.
 *
 * **Can I delete it?** Yes, if you do not care about lingering `vite` processes after closing
 * Electron during local dev. Deleting it does not affect builds, tests, or packaged apps.
 *
 * **Related:** `patches/README.md` documents a separate Windows patch for `taskkill` errors when
 * the Electron PID is already gone.
 */
export function viteElectronDevShutdown(): Plugin {
  let hookedPid: number | undefined;
  let shuttingDown = false;

  return {
    name: 'vite-electron-dev-shutdown',
    apply: 'serve',
    configureServer(server) {
      const shutdown = (code: number | null, signal: NodeJS.Signals | null) => {
        if (shuttingDown) return;
        shuttingDown = true;
        clearInterval(watchId);
        const exitCode =
          typeof code === 'number' && Number.isFinite(code) ? code : signal != null ? 1 : 0;
        void Promise.resolve(server.close())
          .catch(() => {})
          .finally(() => process.exit(exitCode));
      };

      const watchId = setInterval(() => {
        const proc = (process as ProcessWithElectronApp).electronApp;
        if (proc == null || proc.pid === hookedPid) return;

        hookedPid = proc.pid;

        const onEnd = (code: number | null, signal: NodeJS.Signals | null) => {
          shutdown(code, signal);
        };

        proc.once('exit', onEnd);
        proc.once('close', onEnd);
      }, 120);

      return () => clearInterval(watchId);
    },
  };
}
