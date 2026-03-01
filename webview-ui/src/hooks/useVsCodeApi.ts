/**
 * React hook for VSCode API communication
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import type { WebviewMessage, ExtensionMessage } from '../types/webview';

interface VSCodeAPI {
  postMessage: (message: WebviewMessage) => void;
  setState: <T>(state: T) => void;
  getState: <T>() => T | undefined;
}

export function useVsCodeApi() {
  const vscodeRef = useRef<VSCodeAPI | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Acquire VSCode API
    if (typeof acquireVsCodeApi === 'function') {
      vscodeRef.current = acquireVsCodeApi() as VSCodeAPI;
      // Expose globally for the provider's helper function
      (window as any).vscode = vscodeRef.current;
      setIsReady(true);
    } else {
      console.warn('acquireVsCodeApi is not available');
      // Provide a mock for development
      vscodeRef.current = {
        postMessage: (msg) => console.log('Mock postMessage:', msg),
        setState: (state) => {
          try {
            localStorage.setItem('vscodeState', JSON.stringify(state));
          } catch {
            // Ignore storage errors
          }
        },
        getState: () => {
          try {
            const state = localStorage.getItem('vscodeState');
            return state ? JSON.parse(state) : undefined;
          } catch {
            return undefined;
          }
        }
      };
      setIsReady(true);
    }
  }, []);

  const postMessage = useCallback((message: WebviewMessage) => {
    if (vscodeRef.current) {
      vscodeRef.current.postMessage(message);
    } else {
      console.error('VSCode API not available');
    }
  }, []);

  const setState = useCallback(<T>(state: T) => {
    if (vscodeRef.current) {
      vscodeRef.current.setState(state);
    }
  }, []);

  const getState = useCallback(<T>(): T | undefined => {
    if (vscodeRef.current) {
      return vscodeRef.current.getState<T>();
    }
    return undefined;
  }, []);

  return {
    isReady,
    postMessage,
    setState,
    getState
  };
}

/**
 * Hook for listening to messages from the extension
 */
export function useExtensionMessage(handler: (message: ExtensionMessage) => void) {
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const message = event.data;
      if (message && typeof message === 'object' && 'type' in message) {
        handler(message as ExtensionMessage);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [handler]);
}
