/// <reference types="vite/client" />

/**
 * VS Code API for webviews
 */
declare global {
  interface Window {
    acquireVsCodeApi(): {
      postMessage: (message: unknown) => void;
      setState: <T>(state: T) => void;
      getState: <T>() => T | undefined;
    };
  }

  const acquireVsCodeApi: Window['acquireVsCodeApi'];
}

export {};
