import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { viteSingleFile } from 'vite-plugin-singlefile'
import vueDevTools from 'vite-plugin-vue-devtools'

// Определяем базовый URL в зависимости от режима сборки
const getBaseUrl = (mode) => {
  switch (mode) {
    case 'production':
      return 'http://localhost:3000'
    case 'staging':
      return 'http://localhost:3000'
    default:
      return 'http://localhost:3000'
  }
}

export default defineConfig(({ mode }) => ({
  base: './',
  define: {
    'import.meta.env.VITE_API_BASE_URL': JSON.stringify(getBaseUrl(mode))
  },
  plugins: [
    vue({
      template: {
        transformAssetUrls: {
          tags: { img: ['src'], link: ['href'] }
        }
      }
    }),
    vueDevTools(),
    viteSingleFile()
  ],
  build: {
    emptyOutDir: true,
    assetsInlineLimit: 1024 * 1024,
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
        assetFileNames: '[name].[ext]'
      }
    }
  },
  server: {
    port: 5173,
    host: true,
    allowedHosts: ['mobile-basis.gl.at.ply.gg', 'all'], // Явное добавление хоста
  }
}))
