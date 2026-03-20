import { defineConfig } from 'vite';
import electron from 'vite-plugin-electron/simple';
import { rendererPlugins } from './vite.renderer-plugins';

export default defineConfig({
	// Let @rollup/plugin-typescript emit decorators + metadata (tsyringe).
	esbuild: false,
	plugins: [
		...rendererPlugins(),
		electron({
			main: {
				entry: 'electron/main.ts',
			},
			preload: {
				input: 'electron/preload.ts',
			},
			renderer: {},
		}),
	],
	server: {
		port: 5174,
	},
});
