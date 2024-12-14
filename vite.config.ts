import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': resolve(__dirname, './src')
      }
    },
    server: {
      port: 5173,
      host: true,
      proxy: {
        '/api': {
          target: env.VITE_API_URL || 'http://localhost:8888',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '')
        }
      }
    },
    build: {
      outDir: 'dist',
      sourcemap: mode !== 'production',
      // Optimize chunks
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            'firebase-vendor': ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/storage'],
            'ui-vendor': ['@headlessui/react', 'framer-motion', 'lucide-react', 'recharts'],
            'form-vendor': ['react-hook-form', '@hookform/resolvers', 'zod']
          }
        }
      },
      // Optimize dependencies
      commonjsOptions: {
        include: [/node_modules/],
        extensions: ['.js', '.cjs']
      },
      // Minimize output
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: mode === 'production',
          drop_debugger: mode === 'production'
        }
      },
      // Split chunks
      chunkSizeWarningLimit: 1000
    },
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        'firebase/app',
        'firebase/auth',
        'firebase/firestore',
        'firebase/storage',
        '@headlessui/react',
        'framer-motion',
        'lucide-react',
        'recharts',
        'react-hook-form',
        '@hookform/resolvers/zod',
        'zod'
      ]
    },
    // Environment variables
    define: {
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version)
    }
  };
});
