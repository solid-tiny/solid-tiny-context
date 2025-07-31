import { type ComponentProps, splitProps } from 'solid-js';

export function Button(props: ComponentProps<'button'>) {
  const [localProps, others] = splitProps(props, ['class']);
  return (
    <button
      class={['bg-gray-200 p-2', localProps.class].join('')}
      type="button"
      {...others}
    />
  );
}
