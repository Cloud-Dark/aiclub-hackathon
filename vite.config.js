import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base "./" supaya hasil build jalan di sub-path GitHub Pages (…github.io/aiclub-hackathon/)
// build keluar ke docs/ agar bisa dipakai langsung sebagai sumber GitHub Pages
export default defineConfig({
  base: "./",
  plugins: [react()],
  build: { outDir: "docs", emptyOutDir: true }
});
