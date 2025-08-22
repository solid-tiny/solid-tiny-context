import {
  type Accessor,
  batch,
  createComponent,
  createContext,
  createMemo,
  type JSX,
  useContext,
} from 'solid-js';
import { createStore } from 'solid-js/store';
import { access, createWatch, isFn } from 'solid-tiny-utils';
import type {
  Getters,
  MaybeSignals,
  Methods,
  RealContextThis,
  RealState,
} from './types';
import { isUndefined } from './utils/is';
import type { EmptyObject, Fn } from './utils/types';

/**
 * Add a getter to an object.
 */
function addGetter(
  obj: object,
  propName: string,
  getterFunction: () => unknown
) {
  Object.defineProperty(obj, propName, {
    get: getterFunction,
    enumerable: false,
    configurable: true,
  });
}

export function buildRealState<
  T extends object,
  U extends object = EmptyObject,
  M extends Methods = EmptyObject,
  G extends Getters = EmptyObject,
>(params: {
  state: () => T;
  nowrapData?: U;
  getters?: G;
  methods?: M;
}): [...RealState<T, G, M>, U] {
  const { state, getters, methods, nowrapData } = params;

  // init state
  const newState = state();
  const actions: Record<string, Fn> = {};
  const realGetters: Record<string, () => unknown> = {};

  // register getters
  for (const key of Object.keys(getters || {})) {
    addGetter(newState, key, () => realGetters[key]?.());
  }

  // create store
  const [state2, setState] = createStore(newState);
  const realState = [state2, actions] as RealState<T, G, M>;

  // register getters (merge createMemo)
  for (const [key, getterFn] of Object.entries(getters || {})) {
    realGetters[key] = createMemo((prev: unknown) =>
      getterFn.call({ state: state2, nowrapData }, prev)
    );
  }

  // register methods
  for (const [key, methodFn] of Object.entries(methods || {})) {
    if (typeof methodFn === 'function') {
      actions[key] = (...args: unknown[]) =>
        batch(() =>
          methodFn.call({ state: state2, actions, nowrapData }, ...args)
        );
    }
  }

  // setState
  actions.setState = setState;

  return [...realState, (nowrapData || {}) as U];
}

export function buildContext<
  T extends object,
  U extends object = EmptyObject,
  M extends Methods = EmptyObject,
  G extends Getters = EmptyObject,
>(params: {
  state: () => T;
  nowrapData?: () => U;
  getters?: G & ThisType<Omit<RealContextThis<T, U, G, M>, 'actions'>>;
  methods?: M & ThisType<RealContextThis<T, U, G, M>>;
}) {
  const context = createContext([{}, {}, {}] as [...RealState<T, G, M>, U]);

  const useThisContext = () => {
    return useContext(context);
  };

  return {
    useContext: useThisContext,
    initial(initialState?: Partial<MaybeSignals<T>>) {
      // 1. create initial state
      const resolvedInitialState = Object.entries(initialState || {}).reduce(
        (acc, [key, state]) => {
          const realValue = access(state);
          if (!isUndefined(realValue)) {
            acc[key] = realValue;
          }
          return acc;
        },
        {} as Record<string, unknown>
      );

      // 2. create realState
      const value = buildRealState({
        state: () => ({ ...params.state(), ...resolvedInitialState }) as T,
        nowrapData: params.nowrapData?.(),
        getters: params.getters,
        methods: params.methods,
      });

      // 3. if provided reactive initial state, create watch
      for (const [key, state] of Object.entries(initialState || {})) {
        if (isFn(state)) {
          createWatch(state as Accessor<unknown>, (newValue) => {
            if (isUndefined(newValue)) {
              // should fallback to default value when undefined
              // biome-ignore lint/suspicious/noExplicitAny: it's safe here
              value[1].setState(key as any, (params.state() as any)[key]);
              return;
            }
            if (value[0][key] !== newValue) {
              // biome-ignore lint/suspicious/noExplicitAny: it's safe here
              value[1].setState(key as any, newValue);
            }
          });
        }
      }

      // 4. return context provider
      return {
        Provider(props: { children?: JSX.Element }) {
          return createComponent(context.Provider, {
            value,
            get children() {
              return props.children;
            },
          });
        },
        value,
      };
    },
    defaultValue: params.state,
  };
}
