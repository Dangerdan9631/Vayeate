import type { ChildProcess } from 'node:child_process';
import type { Plugin } from 'vite';

type ProcessWithElectronApp = NodeJS.Process & { electronApp?: ChildProcess };

/**
 * vite-plugin-electron spawns Electron and attaches `once('exit', process.exit)`. On some setups the
 * dev server keeps running after the window closes; explicitly closing the Vite server and exiting
 * the Node process fixes that. Re-hooks each time `process.electronApp` is replaced (main/preload
 * rebuild) so hot restart still works.
 */
export function viteElectronDevShutdown(): Plugin {
  let hookedPid: number | undefined;
  let shuttingDown = false;

  return {
    name: 'vite-electron-dev-shutdown',
    apply: 'serve',
    configureServer(server) {
      let watchId: ReturnType<typeof setInterval>;

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

      watchId = setInterval(() => {
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
