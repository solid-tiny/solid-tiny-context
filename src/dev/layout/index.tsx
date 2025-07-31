import { A } from '@solidjs/router';
import { For, type JSX } from 'solid-js';

export function Layout(props: { children: JSX.Element }) {
  const menuItems: {
    label: string;
    href: string;
  }[] = [
    { label: 'Basic', href: '/' },
    { label: 'Global-State', href: '/global-state' },
  ];
  return (
    <div class="flex h-full w-full flex-col">
      <div class="flex-shrink-0">
        <header class="bg-gray-800 p-3 text-white">
          <nav class="flex flex-wrap items-center gap-2">
            <For each={menuItems}>
              {(item) => (
                <A
                  activeClass="text-gray-300"
                  class=" hover:text-gray-300"
                  end
                  href={item.href}
                  inactiveClass="text-gray-400"
                >
                  {item.label}
                </A>
              )}
            </For>
          </nav>
        </header>
      </div>
      <div class="flex-grow p-4">{props.children}</div>
    </div>
  );
}
