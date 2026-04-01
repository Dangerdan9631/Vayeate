/// <reference types="vitest/globals" />
import 'reflect-metadata';
import '@testing-library/jest-dom';
import { container } from 'tsyringe';
import { electronPreloadStubs } from './test-utils/electron-stubs';

// Clear singleton instances before each test so that @singleton() classes are re-created
// with fresh dependencies (e.g. StoreStateSetter) from the current test's AppProvider.
beforeEach(() => {
  container.clearInstances();
  // Node-environment test files (@vitest-environment node) have no `window`; skip preload stubs.
  if (typeof window !== 'undefined') {
    (window as unknown as { electronAPI: object }).electronAPI = electronPreloadStubs();
  }
});

