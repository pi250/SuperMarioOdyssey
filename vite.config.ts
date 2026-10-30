import { defineConfig } from 'vite';

export default defineConfig({
  base: process.env.GITHUB_PAGES ? '/mario-odyssey-web/' : '',
  build: { target: 'es2022', sourcemap: true },
  server: { port: 5173 }
});