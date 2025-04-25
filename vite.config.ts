import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import glsl from "vite-plugin-glsl";
import vercel from "vite-plugin-vercel";

// https://vite.dev/config/
export default defineConfig({
  plugins: [tsconfigPaths(), glsl(), vercel()],
  optimizeDeps: {
    exclude: ["@babylonjs/havok"],
  },
  server: {
    port: process.env.PORT as unknown as number,
  },
});
