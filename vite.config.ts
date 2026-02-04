import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { componentTagger } from 'lovable-tagger';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Ensure Vite loads env vars consistently in both dev + preview builds.
  // We explicitly wire the needed VITE_* variables into `define` so they
  // can't end up as `undefined` due to env loading/caching quirks.
  const env = loadEnv(mode, process.cwd(), '');

  return {
    server: {
      host: '::',
      // port: 8080, // Allow dynamic port selection to avoid HMR errors if 8080 is busy
      proxy: {
        '/api-muslim': {
          target: 'https://muslim-api-three.vercel.app',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api-muslim/, ''),
        },
      },
      hmr: {
        overlay: false,
      },
    },
    define: {
      // These are public values (publishable/anon); safe to embed in client bundle.
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(
        env.VITE_SUPABASE_URL ?? '',
      ),
      'import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY': JSON.stringify(
        env.VITE_SUPABASE_PUBLISHABLE_KEY ?? '',
      ),
      'import.meta.env.VITE_SUPABASE_PROJECT_ID': JSON.stringify(
        env.VITE_SUPABASE_PROJECT_ID ?? '',
      ),
    },
    plugins: [
      react(),
      mode === 'development' && componentTagger(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
        manifest: {
          name: 'MyRamadhanku Journal',
          short_name: 'MyRamadhanku',
          description: 'Jurnal Ramadan yang tenang dan fokus pada ibadah.',
          theme_color: '#020617',
          background_color: '#020617',
          display: 'standalone',
          icons: [
            {
              src: 'pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
            },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
            },
          ],
        },
      }),
    ].filter(Boolean),
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
      // Prevent multiple React copies (common cause of "Invalid hook call")
      dedupe: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        'react/jsx-dev-runtime',
      ],
    },
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        'react/jsx-dev-runtime',
      ],
    },
  };
});
