import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { viteSingleFile } from 'vite-plugin-singlefile'

export default defineConfig({
  base: './',
  plugins: [
    vue({
      template: {
        transformAssetUrls: {
          tags: { img: ['src'], link: ['href'] }
        }
      }
    }),
    viteSingleFile()
  ],
  build: {
    // outDir: '../freeroam/ui',
    emptyOutDir: true,
    assetsInlineLimit: 1024 * 1024, // Встраивать все ресурсы
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        inlineDynamicImports: true, // Главный ключ для single-file
        // УДАЛИТЬ manualChunks - он конфликтует с inlineDynamicImports
        assetFileNames: '[name].[ext]'
      }
    }
  }
})