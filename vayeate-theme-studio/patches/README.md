# `patch-package` patches

Patches in this folder are applied on **`npm install`** via the **`postinstall`** script (`patch-package`). They edit **`node_modules`** so the changes survive reinstalls and are tracked in git.

## `vite-plugin-electron+0.28.8.patch`

**What it changes:** On **Windows** only, `treeKillSync` in `vite-plugin-electron` wraps `taskkill /pid … /T /F` in a try/catch. If the error looks like the process was **already gone** (e.g. you closed the Electron window before the plugin tried to kill the tree), the error is **ignored** instead of thrown.

**Why it exists:** The stock plugin can throw when `taskkill` targets a PID that has already exited. That shows up during dev shutdown/restart on Windows—not a logic bug in this repo, but noisy and confusing.

**Can I delete it?**

- **Try removing it** if you upgrade `vite-plugin-electron` and the new release fixes this upstream (check their changelog/issues), or if you only develop on macOS/Linux (the patch only affects the `win32` branch).
- **Keep the filename in sync** with the installed version: `vite-plugin-electron+<version>.patch` must match `package.json`, or `patch-package` will fail or apply the wrong diff.
- If this is the **only** patch and you remove it, you can also remove **`patch-package`**, the **`postinstall`** script, and this **`patches/`** folder if nothing else needs patching.

**Not the same as** `vite.electron-dev-shutdown.plugin.ts` in the repo root: that file stops the **Vite dev server** when Electron exits. This patch only makes **Windows process teardown** tolerate an already-dead Electron PID.
