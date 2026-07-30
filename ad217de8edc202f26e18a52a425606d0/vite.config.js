import { defineConfig } from 'vite';

// GitHub Pages: https://jimmyrichardson.github.io/poc/ad217de8edc202f26e18a52a425606d0/
// Local dev:    use root `yarn dev` → http://localhost:5173/ad217de8edc202f26e18a52a425606d0/
export default defineConfig(({ command }) => ({
  base: command === 'serve' ? '/' : '/poc/ad217de8edc202f26e18a52a425606d0/dist/',
  root: './ad217de8edc202f26e18a52a425606d0/src',
  build: {
    outDir: './../dist',
    rollupOptions: {
      input: './ad217de8edc202f26e18a52a425606d0/main.js',
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
}));
