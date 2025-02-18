import {sveltekit} from '@sveltejs/kit/vite';
import {defineConfig} from 'vite';
import {comlink} from 'vite-plugin-comlink';

export default defineConfig({
  plugins: [comlink(), sveltekit()],
  worker: {
    plugins: () => [comlink()],
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler', // or 'modern'
        additionalData: `
          @use '$lib/scss/mixins';
        `,
      },
    },
  },
});
