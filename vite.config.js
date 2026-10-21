import { rmSync } from "node:fs";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base "./" supaya hasil build jalan di sub-path GitHub Pages (…github.io/aiclub-hackathon/)
// build keluar ke docs/ agar bisa dipakai langsung sebagai sumber GitHub Pages
// docs/ juga berisi dokumentasi .md, jadi emptyOutDir dimatikan dan hanya docs/assets yang dibersihkan
const cleanAssets = () => ({
  name: "clean-docs-assets",
  buildStart() { rmSync("docs/assets", { recursive: true, force: true }); }
});

export default defineConfig({
  base: "./",
  plugins: [react(), cleanAssets()],
  build: { outDir: "docs", emptyOutDir: false }
});
