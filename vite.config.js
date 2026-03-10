import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    server: {
        port: 3000,
        proxy: {
            // Proxy /api to the Node server when testing dynamic logo in dev (run: npm run build && node server/index.js on port 8000)
            '/api': { target: 'http://localhost:8000', changeOrigin: true },
        },
    },
    build: {
        outDir: 'dist',
    },
});
