import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // Make environment variables available at build time
    'import.meta.env.VITE_GITHUB_TOKEN': JSON.stringify(process.env.VITE_GITHUB_TOKEN || process.env.GITHUB_TOKEN)
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
