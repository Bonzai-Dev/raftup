import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import glsl from "vite-plugin-glsl";

// https://vite.dev/config/
export default defineConfig({
  base: "./",
  plugins: [tsconfigPaths(), glsl()],
  assetsInclude: ["**/*.glb"],
  optimizeDeps: {
    exclude: ["@babylonjs/havok"],
  },
  server: {
    port: 3000,
  },
  build: {
    rollupOptions: {
      output: {
        assetFileNames: "assets/[name][extname]", 
        chunkFileNames: "assets/[name].js",
        entryFileNames: "assets/[name].js",
      },
    },
  },
});
