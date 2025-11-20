import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import os from 'os'

// https://vitejs.dev/config/
// Détecter l'adresse IP locale pour le proxy backend
const getLocalIP = () => {
  const interfaces = os.networkInterfaces()
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // Ignorer les adresses non-IPv4 ou internes
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address
      }
    }
  }
  return 'localhost'
}

// Utiliser la variable d'environnement ou localhost par défaut
// Pour l'accès réseau, définir VITE_BACKEND_HOST dans un fichier .env
const backendHost = process.env.VITE_BACKEND_HOST || 'localhost'
const backendUrl = `http://${backendHost}:8000`

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    host: '0.0.0.0', // Permet l'accès depuis d'autres appareils sur le réseau local
    proxy: {
      '/api': {
        target: backendUrl,
        changeOrigin: true,
        ws: true, // Support WebSocket pour Socket.io
      },
      '/storage': {
        target: backendUrl,
        changeOrigin: true,
      },
    },
  },
})


