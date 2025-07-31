import { presetWind3 } from 'unocss';
import UnoCSS from 'unocss/vite';
import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';
import solidPagesPlugin from 'vite-plugin-solid-pages';

export default defineConfig({
  plugins: [
    UnoCSS({
      presets: [presetWind3()],
    }),
    solidPlugin(),
    solidPagesPlugin({ dir: './src/dev/pages', extensions: ['tsx'] }),
  ],
  root: './src/dev',
});
