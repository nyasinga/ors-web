import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const API_TARGET =
  (process.env.VITE_API_PROXY_TARGET as string | undefined)?.replace(/\/$/, "") ||
  "https://ciprop.mustsacco.co.ke";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Same-origin `/api/*` in local dev avoids browser CORS when the upstream returns 5xx.
      "/api": {
        target: API_TARGET,
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});
