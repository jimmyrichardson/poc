import { defineConfig } from 'vite';

// GitHub Pages: https://jimmyrichardson.github.io/poc/image-depth-parallax/
// Local dev:    use root `yarn dev` → http://localhost:5173/image-depth-parallax/
export default defineConfig(({ command }) => ({
  base: command === 'serve' ? '/' : '/poc/image-depth-parallax/dist/',
  root: './image-depth-parallax/src',
  build: {
    outDir: './../dist',
    rollupOptions: {
      input: './image-depth-parallax/main.js',
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
