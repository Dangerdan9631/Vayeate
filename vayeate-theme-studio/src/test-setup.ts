/// <reference types="vitest/globals" />
import 'reflect-metadata';
import '@testing-library/jest-dom';
import { container } from 'tsyringe';

// Clear singleton instances and registerInstance value providers before each
// test so that @singleton() classes are re-created with fresh dependencies
// (e.g. StoreStateSetter) from the current test's AppProvider.
beforeEach(() => {
  container.clearInstances();
});
