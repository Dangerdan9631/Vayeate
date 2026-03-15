import { describe, expect, it } from 'vitest';
import { loadApplication, unloadApplication } from '.';

describe('app-operations', () => {
  it('loadApplication resolves without throwing', async () => {
    await expect(loadApplication()).resolves.toBeUndefined();
    await expect(loadApplication(undefined)).resolves.toBeUndefined();
    const setState = () => {};
    await expect(loadApplication(setState)).resolves.toBeUndefined();
  });

  it('unloadApplication resolves without throwing', async () => {
    await expect(unloadApplication()).resolves.toBeUndefined();
    await expect(unloadApplication(undefined)).resolves.toBeUndefined();
    const setState = () => {};
    await expect(unloadApplication(setState)).resolves.toBeUndefined();
  });
});
