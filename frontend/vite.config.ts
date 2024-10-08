import path from 'path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    chunkSizeWarningLimit: 1500,
  },
  server: {
    watch: {
      usePolling: true,
    },
    host: '0.0.0.0',
    hmr: { clientPort: 4200 },
    strictPort: true,
    port: 4200,
  },
  preview: {
    host: '0.0.0.0',
    port: 4220,
    // watch:
    //   {usePolling: true}
  },
  // define: {
  //   'import.meta.env.VITE_APP_BACKEND_API_URL': JSON.stringify(process.env.VITE_APP_BACKEND_API_URL),
  //   'import.meta.env.VITE_APP_APP_URL': JSON.stringify(process.env.VITE_APP_APP_URL),
  //   'import.meta.env.VITE_APP_BACKEND_API_VERSION': JSON.stringify(process.env.VITE_APP_BACKEND_API_VERSION),
  // },
});
