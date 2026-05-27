import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Configure Vite to use the modern Tailwind compiler plugin natively
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
})