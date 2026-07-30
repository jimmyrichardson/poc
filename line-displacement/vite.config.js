import { defineConfig } from 'vite';

// GitHub Pages: https://jimmyrichardson.github.io/poc/line-displacement/
// Local dev:    use root `yarn dev` → http://localhost:5173/line-displacement/
export default defineConfig(({ command }) => ({
  base: command === 'serve' ? '/' : '/poc/line-displacement/dist/',
  root: './line-displacement/src',
  build: {
    outDir: './../dist',
    rollupOptions: {
      input: './line-displacement/main.js',
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
