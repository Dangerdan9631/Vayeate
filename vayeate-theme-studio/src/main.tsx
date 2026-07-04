import 'reflect-metadata';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app/components/Common/app-shell/App';
import { container, DependencyContainer } from 'tsyringe';
import { BootstrapAppController } from './app/core/Common/bootstrap/bootstrap-app-controller';
import { BackgroundQueue } from './app/core/Common/background-queue/background-queue';
import { DataIoBackgroundQueue } from './app/core/Common/background-queue/data-io-background-queue';
import { MainBackgroundQueue } from './app/core/Common/background-queue/main-background-queue';
import { DeferredBackgroundQueue } from './app/core/Common/background-queue/deferred-background-queue';
import { WindowService } from './gateway/services/Common/window-service';
import { UndoGateway } from './gateway/gateway/Common/undo/undo-gateway';
import { WindowCallbacksPort } from './domain/operations/Common/app-operations/window-callbacks-port';
import { BackgroundQueuePort } from './domain/operations/Common/background-queue/background-queue-port';
import { UndoPersistencePort } from './domain/operations/Common/undo-operations/undo-persistence-port';

export function registerRendererQueues(registry: DependencyContainer): void {
  registry.register(BackgroundQueuePort, { useClass: BackgroundQueue });
  registry.register(WindowCallbacksPort, { useClass: WindowService });
  registry.register(UndoPersistencePort, { useClass: UndoGateway });
  registry.register(MainBackgroundQueue, { useClass: MainBackgroundQueue });
  registry.register(DeferredBackgroundQueue, { useClass: DeferredBackgroundQueue });
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
