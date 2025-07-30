import type { Accessor } from 'solid-js';
import { isFn } from './is';

export function access<T>(value: Accessor<T> | T): T {
  return isFn(value) ? value() : value;
}
