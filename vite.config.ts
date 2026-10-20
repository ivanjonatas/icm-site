import { defineConfig } from 'vite';

export default defineConfig({
  css: {
    // Use this project's plain CSS instead of inheriting an unrelated parent configuration.
    postcss: {
      plugins: [],
    },
  },
});
