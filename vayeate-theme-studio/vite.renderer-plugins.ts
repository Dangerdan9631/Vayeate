import type { PluginOption } from 'vite';
import react from '@vitejs/plugin-react';
import typescript from '@rollup/plugin-typescript';

/**
 * Shared renderer-side Vite plugins (`vite.config.ts` spreads this into `plugins`).
 *
 * **What it does:** Runs `@vitejs/plugin-react`, then `@rollup/plugin-typescript` for the browser
 * bundle. Project `vite.config.ts` sets `esbuild: false` so transformation goes through this
 * TypeScript path instead of esbuild—that keeps **`emitDecoratorMetadata`** intact for **tsyringe**
 * (esbuild would strip it). Background: https://stackoverflow.com/q/77616517
 *
 * **Rollup override:** Repo `tsconfig.json` uses `allowImportingTsExtensions: true`; Rollup’s TS
 * emit cannot use that (TS5096), so we override it to `false` here only for the bundler.
 *
 * **When it’s needed:** Any time you build or serve the renderer with the current DI setup. If you
 * removed tsyringe decorator metadata (or switched to a compile path that preserves it another
 * way), you could simplify this—for example re-enable Vite’s default esbuild pipeline and possibly
 * drop `@rollup/plugin-typescript` for the renderer—but **do not delete this file on a whim**:
 * without an equivalent, dependency injection will break at runtime.
 */
export function rendererPlugins(): PluginOption[] {
	return [
		react(),
		typescript({
			tsconfig: './tsconfig.json',
			compilerOptions: {
				// Rollup emit path cannot use allowImportingTsExtensions (TS5096).
				allowImportingTsExtensions: false,
			},
		}),
	];
}
