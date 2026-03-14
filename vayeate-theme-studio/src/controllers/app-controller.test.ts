import { beforeEach, describe, expect, it, vi } from 'vitest';
import { loadApplication, unloadApplication } from './app-controller';

describe('app-controller', () => {
  let setState: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    setState = vi.fn();
  });

  it('loadApplication calls loadApplication operation and resolves', async () => {
    await expect(loadApplication(setState)).resolves.toBeUndefined();
  });

  it('unloadApplication calls unloadApplication operation and resolves', async () => {
    await expect(unloadApplication(setState)).resolves.toBeUndefined();
  });
});
