import 'reflect-metadata';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app/app/app-shell/App';
import { container, DependencyContainer } from 'tsyringe';
import { BootstrapAppController } from './app/core/bootstrap/bootstrap-app-controller';
import { BackgroundQueue } from './app/core/background-queue/background-queue';
import { DataIoBackgroundQueue } from './app/core/background-queue/data-io-background-queue';
import { MainBackgroundQueue } from './app/core/background-queue/main-background-queue';
import { WorkerBackgroundQueue } from './app/core/background-queue/worker-background-queue';
import { WindowService } from './gateway/services/window-service';
import { UndoGateway } from './gateway/undo/undo-gateway';
import { WindowCallbacksPort } from './domain/operations/app-operations/window-callbacks-port';
import { BackgroundQueuePort } from './domain/operations/background-queue/background-queue-port';
import { UndoPersistencePort } from './domain/operations/undo-operations/undo-persistence-port';

export function registerRendererQueues(registry: DependencyContainer): void {
  registry.register(BackgroundQueuePort, { useClass: BackgroundQueue });
  registry.register(WindowCallbacksPort, { useClass: WindowService });
  registry.register(UndoPersistencePort, { useClass: UndoGateway });
  registry.register(MainBackgroundQueue, { useClass: MainBackgroundQueue });
  registry.register(WorkerBackgroundQueue, { useClass: WorkerBackgroundQueue });
  registry.register(DataIoBackgroundQueue, { useClass: DataIoBackgroundQueue });
}

export function bootstrapRenderer(registry: DependencyContainer): void {
  void registry.resolve(BootstrapAppController).run();
}

export function mountApp(doc: Document = document): boolean {
  const appRoot = doc.querySelector<HTMLDivElement>('#app');
  if (!appRoot) {
    return false;
  }

  const root = createRoot(appRoot);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
  return true;
}

registerRendererQueues(container);
bootstrapRenderer(container);
mountApp();
