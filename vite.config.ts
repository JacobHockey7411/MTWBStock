import { defineConfig } from 'vite';

export default defineConfig({
  base: '/MTWBStock/', // 👈 MUST match your repo name!
  server: {
    host: '0.0.0.0',
    port: 5000
  }
});
