// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    // Vite dev server runs on 5173 by default
    port: 5173,
    open: true,
  },
});
