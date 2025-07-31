/* @refresh reload */

import routes from 'virtual:pages';
import { Router } from '@solidjs/router';
import { render } from 'solid-js/web';

import './index.css';
import 'uno.css';

const root = document.querySelector('#root');

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error(
    'Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?'
  );
}

// biome-ignore lint/style/noNonNullAssertion: it must be an HTMLElement
render(() => <Router>{routes}</Router>, root!);
