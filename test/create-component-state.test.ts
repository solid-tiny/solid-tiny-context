import { createRoot, createSignal } from 'solid-js';
import { describe, expect, it } from 'vitest';
import { createComponentState } from '../src';

describe('Create component state', () => {
  it('should create a component state', () => {
    const context = createRoot(() => {
      return createComponentState({
        state: () => ({
          count: 0,
        }),
      });
    });

    expect(context).toBeDefined();
    expect(context.defaultValue()).toEqual({
      count: 0,
    });
    expect(context.useContext()).toBeDefined();
    expect(context.initial).toBeDefined();
  });

  it('should handle initial value', () => {
    const [setC, setB, ctx] = createRoot(() => {
      const context = createComponentState({
        state: () => ({
          count: 0,
          bool: false,
        }),
      });

      const [count, setCount] = createSignal<number | undefined>(1);
      const [bool, setBool] = createSignal<boolean | undefined>(false);

      const Context = context.initial({
        count: () => count(),
        bool: () => bool(),
      });

      return [setCount, setBool, Context] as const;
    });

    const [state] = ctx.value;

    expect(state.count).toBe(1);
    expect(state.bool).toBe(false);
    setB(true);
    setC(2);
    expect(state.count).toBe(2);
    expect(state.bool).toBe(true);

    // should fallback to default value when undefined
    setB(undefined);
    setC(undefined);
    expect(state.count).toBe(0);
    expect(state.bool).toBe(false);
  });
});
