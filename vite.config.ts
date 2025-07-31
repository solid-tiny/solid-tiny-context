import UnoCSS from 'unocss/vite';
import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';
import solidPagesPlugin from 'vite-plugin-solid-pages';

export default defineConfig({
  plugins: [
    UnoCSS(),
    solidPlugin(),
    solidPagesPlugin({ dir: './src/dev/pages', extensions: ['tsx'] }),
  ],
  server: {
    port: 5011,
  },
  root: './src/dev',
});
