import adapter from '@sveltejs/adapter-cloudflare';
import {vitePreprocess} from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),

  kit: {
    adapter: adapter({
      include: ['/*'],
      exclude: ['<all>'],
    }),
    alias: {
      '$components/*': 'src/components/*',
      '$types/*': 'src/types/*',
    },
  },
  compilerOptions: {
    warningFilter: warning => !warning.filename?.includes('node_modules') && !warning.code.startsWith('a11y'),
  },
};

export default config;
