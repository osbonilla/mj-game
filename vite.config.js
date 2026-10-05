import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

// Ruta base configurable:
//  - Por defecto './' (rutas relativas): funciona en GitHub Pages en cualquier subcarpeta.
//  - Para fijarla: BASE_PATH=/nombre-del-repo/ npm run build
export default defineConfig({
  base: process.env.BASE_PATH || './',
  plugins: [svelte()],
  build: { target: 'es2020', chunkSizeWarningLimit: 900 },
});
