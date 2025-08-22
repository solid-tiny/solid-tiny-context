import { createRoot } from 'solid-js';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { defineGlobalStore, enableGlobalStore } from '../src';

const createStoredStr = (state: object, ts?: number) => {
  return JSON.stringify({ state, ts: ts || Date.now() });
};

const getLocalStored = (name: string) => {
  return JSON.parse(localStorage.getItem(name) || '{}').state;
};

describe('Define global state', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    localStorage.clear();
    vi.useRealTimers();
  });

  it('should defined a global state', async () => {
    const state = createRoot(() => {
      return defineGlobalStore('test-state', {
        state: () => ({
          count: 0,
        }),
        persist: 'localStorage',
      });
    });

    enableGlobalStore();
    // wait the effect debounce
    await vi.advanceTimersByTimeAsync(1000);
    expect(state).toBeDefined();
    expect(state.length).toBe(3);
    expect(state[0].count).toBe(0);
    expect(getLocalStored('test-state')).toEqual({ count: 0 });
  });

  it('should restore from storage correctly', () => {
    localStorage.setItem('test-state1', createStoredStr({ count: 1 }));
    const context = createRoot(() => {
      return defineGlobalStore('test-state1', {
        state: () => ({
          count: 0,
        }),
        persist: 'localStorage',
      });
    });
    const [state] = context;
    expect(state.count).toBe(0);

    enableGlobalStore();
    expect(state.count).toBe(1);
  });

  it('should save to storage correctly', async () => {
    const context = createRoot(() => {
      return defineGlobalStore('test-state2', {
        state: () => ({
          count: 0,
        }),
        persist: 'localStorage',
      });
    });

    const [, actions] = context;
    enableGlobalStore();
    await vi.advanceTimersByTimeAsync(300);
    expect(getLocalStored('test-state2')).toEqual({ count: 0 });
    actions.setState('count', 1);
    await vi.advanceTimersByTimeAsync(300);
    expect(getLocalStored('test-state2')).toEqual({ count: 1 });

    // debounce
    actions.setState('count', 2);
    await vi.advanceTimersByTimeAsync(100);
    expect(getLocalStored('test-state2')).toEqual({ count: 1 });
    actions.setState('count', 3);
    await vi.advanceTimersByTimeAsync(100);
    expect(getLocalStored('test-state2')).toEqual({ count: 1 });
    actions.setState('count', 4);
    await vi.advanceTimersByTimeAsync(100);
    expect(getLocalStored('test-state2')).toEqual({ count: 1 });
    await vi.advanceTimersByTimeAsync(200);
    expect(getLocalStored('test-state2')).toEqual({ count: 4 });
  });

  it('should listen storage change', async () => {
    const state = createRoot(() => {
      return defineGlobalStore('test-state3', {
        state: () => ({
          count: 0,
        }),
        persist: 'localStorage',
      })[0];
    });
    enableGlobalStore();
    await vi.advanceTimersByTimeAsync(500);
    // simulate storage change
    window.dispatchEvent(
      new StorageEvent('storage', {
        key: 'test-state3',
        oldValue: null,
        newValue: createStoredStr({ count: 2 }),
        storageArea: localStorage,
      })
    );
    await vi.advanceTimersByTimeAsync(500);
    expect(state.count).toBe(2);
  });
});
