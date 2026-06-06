import 'reflect-metadata';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { DependencyContainer } from 'tsyringe';

const mockRender = vi.fn();
const mockCreateRoot = vi.fn(() => ({ render: mockRender }));
const bootstrapRun = vi.fn();

vi.mock('react-dom/client', () => ({
  createRoot: mockCreateRoot,
}));

vi.mock('./app/app/app-shell/App', () => ({
  App: () => React.createElement('div', { 'data-testid': 'app-shell' }),
}));

vi.mock('./app/core/bootstrap/bootstrap-app-controller', () => ({
  BootstrapAppController: class BootstrapAppController {
    run(): void {
      bootstrapRun();
    }
  },
}));

describe('renderer bootstrap', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.body.innerHTML = '';
  });

  it('registers renderer queue providers on the container', async () => {
    const { registerRendererQueues } = await import('./main');
    const registrations: Array<{ token: string; provider: unknown }> = [];
    const fakeContainer = {
      register: vi.fn((token: string, provider: unknown) => {
        registrations.push({ token, provider });
      }),
    } as unknown as DependencyContainer;

    registerRendererQueues(fakeContainer);

    expect(registrations.map((entry) => entry.token)).toEqual([
      'IActionQueue',
      'IBackgroundMainQueue',
      'IBackgroundWorkerQueue',
      'IBackgroundDataIoQueue',
    ]);
  });

  it('delegates bootstrap to the bootstrap controller', async () => {
    const { bootstrapRenderer } = await import('./main');
    const fakeContainer = {
      resolve: vi.fn(() => ({ run: bootstrapRun })),
    } as unknown as DependencyContainer;

    bootstrapRenderer(fakeContainer);

    expect(bootstrapRun).toHaveBeenCalledTimes(1);
  });

  it('mounts the app only when the root element exists', async () => {
    const { mountApp } = await import('./main');

    expect(mountApp(document)).toBe(false);
    expect(mockCreateRoot).not.toHaveBeenCalled();

    document.body.innerHTML = '<div id="app"></div>';

    expect(mountApp(document)).toBe(true);
    expect(mockCreateRoot).toHaveBeenCalledTimes(1);
    expect(mockRender).toHaveBeenCalledTimes(1);
  });
});
