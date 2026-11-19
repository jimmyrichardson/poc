import { defineConfig } from 'vite';

// GitHub Pages: https://jimmyrichardson.github.io/poc/belonging-by-design/
// Local dev:    use root `yarn dev` → http://localhost:5173/belonging-by-design/
export default defineConfig(({ command }) => ({
  base: command === 'serve' ? '/' : '/poc/belonging-by-design/dist/',
  root: './belonging-by-design/src',
  build: {
    outDir: './../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: './belonging-by-design/main.js',
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
