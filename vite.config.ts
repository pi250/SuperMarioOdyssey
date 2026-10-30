import { defineConfig } from 'vite';

export default defineConfig({
  base: process.env.GITHUB_PAGES ? '/SuperMarioOdyssey/' : '',
  build: { target: 'es2022', sourcemap: true },
  server: { port: 5173 }
});
