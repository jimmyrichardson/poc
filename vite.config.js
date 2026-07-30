import { defineConfig } from 'vite';
import { githubPagesDevAssets } from './vite.plugins.js';

// GitHub Pages: https://jimmyrichardson.github.io/poc/
// Local dev:    http://localhost:5173/<subdir>/
export default defineConfig(({ command }) => ({
  base: command === 'serve' ? '/' : '/poc/dist/',
  appType: 'mpa',
  plugins: [githubPagesDevAssets()],
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: 'main.js',
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
  }
}));
