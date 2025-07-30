import type { Fn } from './types';

export function isUndefined(value: unknown): value is undefined {
  return value === undefined;
}

export function isDef(value: unknown) {
  return !isUndefined(value);
}

export function isFn(value: unknown): value is Fn {
  return typeof value === 'function';
}
