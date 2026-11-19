/* eslint-env node */
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// In dev, serve /api/* with the same handlers Vercel runs in production.
const devApi = (env) => ({
  name: 'dev-api',
  configureServer(server) {
    Object.assign(process.env, env);
    server.middlewares.use('/api/order', async (req, res) => {
      const { default: handler } = await server.ssrLoadModule('/api/order.js');
      handler(req, res);
    });
  },
});

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'TELEGRAM_');
  return {
    plugins: [react(), devApi(env)],
    server: {
      port: 5173,
      open: true,
    },
  };
});
