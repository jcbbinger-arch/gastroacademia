import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // Correct way to pass env var in Vite if it exists in system environment
    // Use optional chaining or fallback to avoid build errors if env is missing locally
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY || "")
  }
});