import { defineConfig } from 'vite';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  root: '.',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        passes: 2,
        pure_funcs: ['console.log', 'console.debug'],
      },
      mangle: {
        safari10: true,
      },
      format: {
        comments: false,
      },
    },
    cssCodeSplit: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        authLogin: resolve(__dirname, 'authentication/index.html'),
        signup: resolve(__dirname, 'authentication/signup.html'),
        forgotPassword: resolve(__dirname, 'authentication/forgot-password.html'),
        otp: resolve(__dirname, 'authentication/otp.html'),
        dashboard: resolve(__dirname, 'frontend/index.html'),
      },
      output: {
        assetFileNames: 'assets/[name]-[hash][extname]',
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        manualChunks: (id) => {
          // Vendor chunking for better caching
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
      },
    },
    target: 'es2018',
    cssMinify: true,
    assetsInlineLimit: 0,
    // Generate sourcemaps for production debugging (optional, comment out for production)
    // sourcemap: false,
  },
  server: {
    port: 3000,
    open: '/',
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [],
  },
});
