import { defineConfig } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig({
  plugins: [
    viteStaticCopy({
      targets: [
        {
          // Copy all .drc files from the assets/draco folder to the build directory
          src: 'src/assets/draco/*.drc',
          dest: 'assets/draco',
        },
      ],
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        // Optional: If needed to ensure proper output directory structure
        assetFileNames: 'assets/[name].[ext]',
      },
    },
  },
  server: {
    // Configure the server to handle .drc files as application/octet-stream
    mimeTypes: {
      'application/octet-stream': ['drc'],
    },
  },
  assetsInclude: ['**/*.drc'],
});
