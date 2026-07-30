import { defineConfig } from 'vite';

// Copy this folder, replace [PROJECT_NAME], then wire a build script in package.json.
// GitHub Pages: https://jimmyrichardson.github.io/poc/[PROJECT_NAME]/
// Local dev:    use root `yarn dev` → http://localhost:5173/[PROJECT_NAME]/
export default defineConfig(({ command }) => ({
  base: command === 'serve' ? '/' : '/poc/[PROJECT_NAME]/dist/',
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
}));
