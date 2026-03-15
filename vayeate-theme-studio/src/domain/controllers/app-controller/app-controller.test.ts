import { beforeEach, describe, expect, it, vi } from 'vitest';
import { loadApplication, unloadApplication } from '.';

describe('app-controller', () => {
  let setState: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    setState = vi.fn();
  });

  it('loadApplication composes operations and resolves', async () => {
    await expect(loadApplication(setState)).resolves.toBeUndefined();
  });

  it('unloadApplication composes operations and resolves', async () => {
    await expect(unloadApplication(setState)).resolves.toBeUndefined();
  });
});
