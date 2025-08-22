import { batch, createRoot } from 'solid-js';
import { isServer } from 'solid-js/web';
import { createDebouncedWatch } from 'solid-tiny-utils';
import { buildRealState } from './base-context';
import type { Getters, Methods, RealContextThis } from './types';
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
  actions: { setState: (...arg: unknown[]) => void }
) {
  type Stored = {
    state: Partial<T>;
    ts: number;
  };

  const write = (data: Partial<T>) => {
    const payload: Stored = { state: data, ts: Date.now() };
    storage.setItem(name, JSON.stringify(payload));
  };

  const read = (): Stored | null => {
    const raw = storage.getItem(name);
    if (!raw) {
      return null;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  };
  // restore localstorage to state
  const restore = () => {
    const stored = read();
    if (stored) {
      batch(() => {
        actions.setState(stored.state);
      });
    } else {
      write(state);
    }
  };

  restore();

  createDebouncedWatch(
    () => JSON.stringify(state),
    () => {
      write(state);
    },
    { delay: 200 }
  );

  // 跨标签页同步
  window.addEventListener('storage', (e) => {
    if (e.key !== name || !e.newValue) {
      return;
    }
    try {
      const incoming = JSON.parse(e.newValue) as Stored;
      const current = read();

      // only update if incoming is newer
      if (!current || incoming.ts > current.ts) {
        batch(() => {
          actions.setState(incoming.state);
        });
      }
    } catch {
      // do nothing
    }
  });
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

/**
 * !only run once
 *
 * run after rendered is suggested
 */
function enableGlobalStore() {
  createRoot(() => {
    for (const fn of shouldRun) {
      fn();
    }
  });
}

export { defineGlobalStore, enableGlobalStore };
