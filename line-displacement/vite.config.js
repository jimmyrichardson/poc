import { defineConfig } from 'vite';

export default defineConfig({
  root: './line-displacement/src',
  build: {
    outDir: './../dist',
    rollupOptions: {
      input: './line-displacement/main.js'
    }
  },
});