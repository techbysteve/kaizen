import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

// https://vite.dev/config/
export default defineConfig({
	plugins: [react(), tailwindcss()],
	root: "src/mainview",
	base: "./",
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src/mainview"),
			"@/components": path.resolve(__dirname, "./src/mainview/components"),
			"@/lib": path.resolve(__dirname, "./src/mainview/lib"),
			"@/hooks": path.resolve(__dirname, "./src/mainview/hooks"),
			"@/contexts": path.resolve(__dirname, "./src/mainview/contexts"),
			"@/bun": path.resolve(__dirname, "./src/bun"),
		},
	},
	build: {
		outDir: "../../dist",
		emptyOutDir: true,
	},
	server: {
		port: 5173,
		strictPort: true,
	},
});
