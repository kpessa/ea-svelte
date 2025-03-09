import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import path from 'path'
import sveltePreprocess from 'svelte-preprocess'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    svelte({
      preprocess: sveltePreprocess()
    })
  ],
  resolve: {
    alias: {
      '@': '/src',
      $lib: path.resolve('./src/lib')
    }
  }
})
