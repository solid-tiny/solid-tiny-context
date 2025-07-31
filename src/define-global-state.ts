import { createRoot } from 'solid-js';
import { isServer } from 'solid-js/web';
import { buildRealState } from './base-context';
import type { Getters, Methods, RealContextThis } from './types';
import { createWatch } from './utils/effect';
import type { EmptyObject } from './utils/types';

export function getBrowserApi<T extends keyof Window>(
  windowApi: T
): Window[T] | null {
  if (!isServer) {
    return window[windowApi];
  }
  return null;
}

const shouldRun: (() => void)[] = [];

function setupPersistence<T extends object>(
  name: string,
  storage: Storage,
  state: T,
  actions: { setState: (key: keyof T, value: unknown) => void }
) {
  // 恢复本地存储
  const restore = () => {
    const stored = storage.getItem(name);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        for (const [key, value] of Object.entries(parsed)) {
          if (state[key as keyof T] !== value) {
            actions.setState(key as keyof T, value);
          }
        }
      } catch {
        storage.setItem(name, JSON.stringify(state));
      }
    }
  };

  // watch 持久化
  createWatch(
    () => Object.keys(state),
    () => {
      storage.setItem(name, JSON.stringify(state));
    }
  );

  // 跨标签页同步
  window.addEventListener('storage', (e) => {
    if (e.key === name && e.newValue) {
      try {
        const parsed = JSON.parse(e.newValue);
        for (const [key, value] of Object.entries(parsed)) {
          if (state[key as keyof T] !== value) {
            actions.setState(key as keyof T, value);
          }
        }
      } catch {
        storage.setItem(name, JSON.stringify(state));
      }
    }
  });

  restore();
}

function defineGlobalStore<
  T extends object,
  U extends object = EmptyObject,
  M extends Methods = EmptyObject,
  G extends Getters = EmptyObject,
>(
  name: string,
  params: {
    state: () => T;
    nowrapData?: U;
    getters?: G & ThisType<Omit<RealContextThis<T, U, G, M>, 'actions'>>;
    methods?: M & ThisType<RealContextThis<T, U, G, M>>;
    persist?: 'sessionStorage' | 'localStorage';
  }
) {
  return createRoot(() => {
    const context = buildRealState(params);

    if (params.persist) {
      const storage = getBrowserApi(params.persist);
      if (storage) {
        const [state, actions] = context;
        shouldRun.push(() => setupPersistence(name, storage, state, actions));
      }
    }

    return context;
  });
}

function enableGlobalStore() {
  createRoot(() => {
    for (const fn of shouldRun) {
      fn();
    }
  });
}

export { defineGlobalStore, enableGlobalStore };
