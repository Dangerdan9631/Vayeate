export type WindowStateEvent = 'minimized' | 'maximized' | 'unmaximized' | 'restored';

export type WindowEventSubscriptions = {
  onWindowState?: (callback: (event: WindowStateEvent) => void) => (() => void) | undefined;
  onWindowResize?: (
    callback: (size: { width: number; height: number }) => void,
  ) => (() => void) | undefined;
  onWindowMove?: (
    callback: (position: { x: number; y: number }) => void,
  ) => (() => void) | undefined;
};

let transport: WindowEventSubscriptions = {};

export function initWindowEventTransport(nextTransport: WindowEventSubscriptions): void {
  transport = nextTransport;
}

export function getWindowEventTransport(): WindowEventSubscriptions {
  return transport;
}
