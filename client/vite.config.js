import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import mkcert from 'vite-plugin-mkcert';

export default defineConfig({
  plugins: [react(), mkcert()],
  server: {
    https: true, // Enable HTTPS
    host: '0.0.0.0', // Allow access from network
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8000', // Backend (Laravel) - stays HTTP
        changeOrigin: true,
        secure: false // Allow HTTP backend even though frontend is HTTPS
      }
    }
  }
});
