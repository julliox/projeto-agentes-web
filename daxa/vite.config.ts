import { defineConfig } from 'vite';
import { VitePluginNode } from 'vite-plugin-node';

export default defineConfig({
  define: {
    global: 'globalThis',
  },
  plugins: [
    ...VitePluginNode({
      adapter: 'express',
      appPath: './server.ts',
      exportName: 'viteNodeApp',
      tsCompiler: 'swc',
    }),
  ],
  server: {
    port: 4200,
    host: 'localhost',
    hmr: {
      port: 24678,
      host: 'localhost'
    },
    watch: {
      usePolling: false,
      interval: 1000,
      binaryInterval: 3000,
      ignoreInitial: true,
      ignored: [
        '**/node_modules/**',
        '**/dist/**',
        '**/.git/**',
        '**/coverage/**'
      ]
    }
  },
  build: {
    target: 'es2020',
    minify: 'esbuild',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['@angular/core', '@angular/common', '@angular/material'],
          rxjs: ['rxjs'],
          charts: ['apexcharts', 'ng-apexcharts']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  },
  optimizeDeps: {
    include: [
      '@angular/core',
      '@angular/common',
      '@angular/material',
      'rxjs',
      'apexcharts'
    ],
    exclude: ['@angular/ssr']
  },
  esbuild: {
    target: 'es2020',
    supported: {
      'bigint': true
    }
  }
});

