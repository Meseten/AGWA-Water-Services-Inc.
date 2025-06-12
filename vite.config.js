import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/AGWA-Water-Services-Inc./',
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
  },
});