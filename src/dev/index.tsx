/* @refresh reload */

import routes from 'virtual:pages';
import { Router } from '@solidjs/router';
import { render } from 'solid-js/web';

import './index.css';
import 'uno.css';
import { defineGlobalStore, enableGlobalStore } from '../define-global-state';
import { Layout } from './layout';

const root = document.querySelector('#root');

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error(
    'Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?'
  );
}

const globalState = defineGlobalStore('globalState', {
  state: () => ({
    count: 0,
    message: 'Hello, SolidJS!',
  }),
  methods: {
    increment() {
      this.actions.setState('count', (prev) => prev + 1);
    },
    hello() {
      this.actions.setState('message', (prev) =>
        prev === 'Hello, world' ? 'Hello, SolidJS!' : 'Hello, world'
      );
    },
  },
  persist: 'localStorage',
});

export function useGlobalState() {
  return globalState;
}

render(
  () => (
    <Router
      root={(props) => {
        return <Layout>{props.children}</Layout>;
      }}
    >
      {routes}
    </Router>
  ),
  // biome-ignore lint/style/noNonNullAssertion: it must be an HTMLElement
  root!
);

enableGlobalStore();
