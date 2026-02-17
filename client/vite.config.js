import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react'; // Make sure this is imported!

export default defineConfig({
  // 1. Tell Vite to use relative paths for everything
  base: './', 
  
  // 2. Look for the .env in the root
  envDir: '../',

  server: {
    // 3. Allow all hosts so Cloudflare/Proxy doesn't get blocked
    allowedHosts: 'all', 
    
    // 4. We don't need a proxy block here anymore! 
    // Your proxy.js (8080) handles this now.
  },
  
  plugins: [react()],
});