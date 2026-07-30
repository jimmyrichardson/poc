import { defineConfig } from 'vite';

// GitHub Pages: https://jimmyrichardson.github.io/poc/clouds/
// Local dev:    use root `yarn dev` → http://localhost:5173/clouds/
export default defineConfig(({ command }) => ({
  base: command === 'serve' ? '/' : '/poc/clouds/dist/',
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
}));
