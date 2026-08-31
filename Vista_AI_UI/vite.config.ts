
import react from '@vitejs/plugin-react';

import path from 'path';

import { defineConfig } from 'vite';

 

export default defineConfig({

  base: '/',

  plugins: [react()],

  server: {

    port: 5173,

  },

  resolve: {
    alias: [
      { find: 'design-language/themes.scss', replacement: path.resolve(__dirname, './src/vendor/design-language/themes.scss') },
      { find: 'design-language/colors', replacement: path.resolve(__dirname, './src/vendor/design-language/colors.js') },
      { find: 'design-language/utilities/DateFunctions', replacement: path.resolve(__dirname, './src/vendor/design-language/utilities/DateFunctions.js') },
      { find: /^design-language$/, replacement: path.resolve(__dirname, './src/vendor/design-language/index.jsx') },
      { find: '@', replacement: path.resolve(__dirname, './src') },
    ],
  },

  optimizeDeps: {

    include: ['design-language', 'design-language/colors', 'design-language/utilities/DateFunctions', 'react', 'react-dom', 'react/jsx-runtime']

  },

 

  css: {

    preprocessorOptions: {

      scss: {

        quietDeps: true,

        silenceDeprecations: ['import'],

      },

    },

  },

  build: {

    target: 'esnext',

    commonjsOptions: {

      include: [/node_modules/],

      transformMixedEsModules: true

    },

    rollupOptions: {

      output: {

        manualChunks: {

          'vendor-react': ['react', 'react-dom'],

        },

      },

    },

  },

  esbuild: {

    jsx: 'automatic',

    jsxImportSource: 'react'

  },

});

 

 

 
