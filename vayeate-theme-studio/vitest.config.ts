import { defineConfig } from 'vitest/config';
import { rendererPlugins } from './vite.renderer-plugins';

export default defineConfig({
	esbuild: false,
	plugins: [...rendererPlugins()],
	test: {
		environment: 'jsdom',
		globals: true,
		testTimeout: 60000,
		exclude: ['**/node_modules/**', '**/dist/**', '**/dist-electron/**', '**/electron/**'],
		setupFiles: ['./src/test-setup.ts'],
	},
});
