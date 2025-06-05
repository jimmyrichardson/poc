import { defineConfig } from 'vite';

export default defineConfig({
  base: '/poc/clouds/dist/',
  root: './clouds/src',
  build: {
    outDir: './../dist',
    rollupOptions: {
      input: './clouds/main.js',
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