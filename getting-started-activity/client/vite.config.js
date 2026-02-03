import {defineConfig} from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  envDir: '../',
  server: {
    // FIX: Changed { } to [ ] for the array
    allowedHosts: [
      "blink-avi-nutten-commander.trycloudflare.com"
    ],
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
        ws: true,
      },
    },
   
  },
});