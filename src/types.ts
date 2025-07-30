import type { SetStoreFunction } from 'solid-js/store';
import type { Fn } from './utils/types';

export interface Methods {
  setState?: undefined;
  [key: string]: Fn | undefined;
}

export type MaybeSignals<T extends object> = {
  [K in keyof T]: T[K] | (() => T[K] | undefined);
};

type GetterObj<T extends Getters> = { [K in keyof T]: ReturnType<T[K]> };

export type RealState<T, G extends Getters, M> = [
  Readonly<T & GetterObj<G>>,
  Omit<M, 'setState' | keyof G> & { setState: SetStoreFunction<T> },
];

export interface Getters {
  [key: string]: <T>(prev: T) => T;
}

export interface RealContextThis<T, U, G extends Getters, M> {
  state: RealState<T, G, M>[0];
  actions: RealState<T, G, M>[1];
  nowrapData: U;
}
