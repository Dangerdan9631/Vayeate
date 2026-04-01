import { singleton } from 'tsyringe';

export type WindowStateEvent = 'minimized' | 'maximized' | 'unmaximized' | 'restored';
export interface WindowInitCallbacks {
  onStateEvent: (event: WindowStateEvent) => void;
  onResize: (size: { width: number; height: number }) => void;
  onMove: (position: { x: number; y: number }) => void;
  onViewportResize: (size: { width: number; height: number }) => void;
  onGlobalKeyDown: (e: KeyboardEvent) => void;
}

@singleton()
export class WindowService {
  private unsubscribes: Array<() => void> = [];

  private getAPI() {
    const api = window.electronAPI;
    if (!api) {
      throw new Error('Electron API not available. Run the app in Electron.');
    }
    return api;
  }

  async close(): Promise<void> {
    await this.getAPI().closeWindow?.();
  }

  async minimize(): Promise<void> {
    await this.getAPI().minimizeWindow?.();
  }

  async maximize(): Promise<void> {
    await this.getAPI().maximizeWindow?.();
  }

  async restore(): Promise<void> {
    await this.getAPI().restoreWindow?.();
  }

  async drag(): Promise<void> {
    await this.getAPI().dragWindow?.();
  }

  async reload(): Promise<void> {
    await this.getAPI().reloadWindow?.();
  }

  async reloadForce(): Promise<void> {
    await this.getAPI().reloadWindowForce?.();
  }

  async toggleDevTools(): Promise<void> {
    await this.getAPI().toggleDevTools?.();
  }

  async getWindowBounds(): Promise<{ x: number; y: number; width: number; height: number }> {
    return this.getAPI().getWindowBounds();
  }

  init(callbacks: WindowInitCallbacks): void {
    const api = this.getAPI();
    for (const u of this.unsubscribes) {
      u();
    }
    this.unsubscribes = [];

    const push = (u: (() => void) | undefined) => {
      if (u) this.unsubscribes.push(u);
    };
    push(api.onWindowState?.(callbacks.onStateEvent));
    push(api.onWindowResize?.(callbacks.onResize));
    push(api.onWindowMove?.(callbacks.onMove));

    this.registerGlobalKeyDown(callbacks.onGlobalKeyDown);
    this.subscribeViewportResize(callbacks.onViewportResize);

    // One-shot hydration on init: set initial BrowserWindow bounds into state if available.
    void api
      .getWindowBounds?.()
      .then((b) => {
        callbacks.onMove({ x: b.x, y: b.y });
        callbacks.onResize({ width: b.width, height: b.height });
      })
      .catch(() => {});
  }

  addWindowListener<K extends keyof WindowEventMap>(
    type: K,
    listener: (this: Window, ev: WindowEventMap[K]) => void,
    options?: boolean | AddEventListenerOptions,
  ): () => void {
    window.addEventListener(type, listener as EventListener, options);
    const unsub = () => window.removeEventListener(type, listener as EventListener, options);
    this.unsubscribes.push(unsub);
    return () => {
      unsub();
      const i = this.unsubscribes.indexOf(unsub);
      if (i >= 0) this.unsubscribes.splice(i, 1);
    };
  }

  addDocumentListener<K extends keyof DocumentEventMap>(
    type: K,
    listener: (this: Document, ev: DocumentEventMap[K]) => void,
    options?: boolean | AddEventListenerOptions,
  ): () => void {
    document.addEventListener(type, listener as EventListener, options);
    const unsub = () => document.removeEventListener(type, listener as EventListener, options);
    this.unsubscribes.push(unsub);
    return () => {
      unsub();
      const i = this.unsubscribes.indexOf(unsub);
      if (i >= 0) this.unsubscribes.splice(i, 1);
    };
  }

  registerGlobalKeyDown(handler: (e: KeyboardEvent) => void): () => void {
    window.addEventListener('keydown', handler as EventListener);
    const unsub = () => window.removeEventListener('keydown', handler as EventListener);
    this.unsubscribes.push(unsub);
    return () => {
      unsub();
      const i = this.unsubscribes.indexOf(unsub);
      if (i >= 0) this.unsubscribes.splice(i, 1);
    };
  }

  /** Pushes viewport (innerWidth/innerHeight) on resize and once immediately. */
  subscribeViewportResize(onChange: (size: { width: number; height: number }) => void): () => void {
    const fn = () => onChange({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', fn);
    fn();
    const unsub = () => window.removeEventListener('resize', fn);
    this.unsubscribes.push(unsub);
    return () => {
      unsub();
      const i = this.unsubscribes.indexOf(unsub);
      if (i >= 0) this.unsubscribes.splice(i, 1);
    };
  }

  dispose(): void {
    for (const u of this.unsubscribes) {
      u();
    }
    this.unsubscribes = [];
  }
}
