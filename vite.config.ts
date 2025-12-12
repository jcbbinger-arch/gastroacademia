import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // Reemplaza process.env.API_KEY con el valor real durante el build
    // Se usa JSON.stringify para asegurar que se inserte como string válido
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY || "")
  }
});