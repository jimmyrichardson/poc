import { defineConfig } from 'vite';

export default defineConfig({
  base: '/poc/[PROJECT_NAME]/dist/',
  root: './[PROJECT_NAME]/src',
  build: {
    outDir: './../dist',
    rollupOptions: {
      input: './[PROJECT_NAME]/main.js',
      output: {
        entryFileNames: 'assets/main.js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && assetInfo.name.endsWith('.css')) {
            return 'assets/main.css';
          }
          return 'assets/[name][extname]';
        }
      }
    }
  },
});