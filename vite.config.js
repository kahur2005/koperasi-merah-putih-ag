import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ['supplemental-register-shareware-tramadol.trycloudflare.com'],
  },
});