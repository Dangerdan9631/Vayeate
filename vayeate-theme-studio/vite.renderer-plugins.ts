import type { PluginOption } from 'vite';
import react from '@vitejs/plugin-react';
import typescript from '@rollup/plugin-typescript';

/**
 * Renderer pipeline: React first, then TypeScript so `emitDecoratorMetadata` is preserved
 * for tsyringe (esbuild strips it). See https://stackoverflow.com/q/77616517
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
