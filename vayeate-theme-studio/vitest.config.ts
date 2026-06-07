import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';
import { rendererPlugins } from './vite.renderer-plugins';

const testSetupFile = fileURLToPath(new URL('./src/test-setup.ts', import.meta.url));

export default defineConfig({
	esbuild: false,
	plugins: [...rendererPlugins()],
	test: {
		environment: 'jsdom',
		globals: true,
		testTimeout: 60000,
		exclude: ['**/node_modules/**', '**/dist/**', '**/dist-electron/**', '**/electron/**'],
		setupFiles: [testSetupFile],
	},
});
