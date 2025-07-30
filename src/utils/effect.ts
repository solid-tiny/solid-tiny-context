import type {
  Accessor,
  AccessorArray,
  EffectFunction,
  OnEffectFunction,
} from 'solid-js';
import { createEffect, on } from 'solid-js';

export function createWatch<S, Next extends Prev, Prev = Next>(
  targets: AccessorArray<S> | Accessor<S>,
  fn: OnEffectFunction<S, undefined | NoInfer<Prev>, Next>,
  opt?: {
    defer?: boolean;
  }
) {
  createEffect(
    on(targets, fn, { defer: opt?.defer }) as EffectFunction<
      undefined | NoInfer<Next>
    >
  );
}
