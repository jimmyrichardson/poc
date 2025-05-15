import { defineConfig } from 'vite';

export default defineConfig({
  root: './image-depth-parallax/src',
  build: {
    outDir: './../dist',
    rollupOptions: {
      input: './image-depth-parallax/main.js'
    }
  }
});