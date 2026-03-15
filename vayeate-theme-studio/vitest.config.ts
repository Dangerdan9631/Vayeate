import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
	plugins: [react()],
	test: {
		environment: 'jsdom',
		globals: true,
		testTimeout: 60000,
		exclude: ['**/node_modules/**', '**/dist/**', '**/dist-electron/**', '**/electron/**'],
		setupFiles: ['./src/test-setup.ts'],
	},
});
