import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 9999,
    open: true,
  },
  build: {
    // Optimize chunks for better loading performance
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['react-i18next', 'i18next'],
          'utils-vendor': ['axios', 'zustand'],
          
          // Feature chunks
          'teams': [
            './src/pages/teams/index.tsx',
            './src/pages/teams/detail.tsx',
            './src/components/teams/TeamForm.tsx',
            './src/components/teams/PlayerSelectionModal.tsx',
            './src/store/teamStore.ts'
          ],
          'players': [
            './src/pages/players/index.tsx',
            './src/pages/players/detail.tsx',
            './src/components/players/PlayerForm.tsx',
            './src/store/playerStore.ts'
          ],
          'tournaments': [
            './src/pages/tournaments/index.tsx',
            './src/pages/tournaments/detail.tsx',
            './src/components/tournaments/TournamentForm.tsx',
            './src/components/tournaments/TeamSelectionModal.tsx',
            './src/store/tournamentStore.ts'
          ]
        }
      }
    },
    // Optimize build size
    target: 'esnext',
    minify: 'esbuild',
    sourcemap: true,
    
    // Chunk size warnings
    chunkSizeWarningLimit: 1000,
  },
  
  // Enable bundle analysis
  define: {
    __BUNDLE_ANALYZE__: process.env.ANALYZE === 'true'
  }
});
