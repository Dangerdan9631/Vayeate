import { defineConfig } from 'vite';
import electron from 'vite-plugin-electron/simple';
import { rendererPlugins } from './vite.renderer-plugins';
import { viteElectronDevShutdown } from './vite.electron-dev-shutdown.plugin';

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
		viteElectronDevShutdown(),
	],
	server: {
		port: 5174,
	},
});
