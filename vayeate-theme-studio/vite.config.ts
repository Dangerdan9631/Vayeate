import { defineConfig } from 'vite';
import electron from 'vite-plugin-electron/simple';
import { rendererPlugins } from './vite.renderer-plugins';
import { viteElectronDevShutdown } from './vite.electron-dev-shutdown.plugin';

export default defineConfig(({ mode }) => {
	const isDebug = mode === 'debug';
	const debugViteBuild = isDebug ? { build: { sourcemap: true } } : undefined;

	return {
		// Let @rollup/plugin-typescript emit decorators + metadata (tsyringe).
		esbuild: false,
		plugins: [
			...rendererPlugins(),
			electron({
				main: {
					entry: 'electron/main.ts',
					vite: debugViteBuild,
					onstart: isDebug
						? ({ startup }) =>
								startup([
									'--inspect=9229',
									'--remote-debugging-port=9222',
									'--renderer-startup-dialog',
									'--no-sandbox',
									'.',
								])
						: undefined,
				},
				preload: {
					input: 'electron/preload.ts',
					vite: debugViteBuild,
				},
				renderer: {},
			}),
			viteElectronDevShutdown(),
		],
		server: {
			port: 5174,
		},
	};
});
