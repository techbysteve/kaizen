import type { ElectrobunConfig } from "electrobun";

export default {
	app: {
		name: "Kaizen",
		identifier: "net.kaizenhq.desktop",
		version: "1.0.0",
	},
	build: {
		// Vite builds to dist/, we copy from there
		copy: {
			"dist/index.html": "views/mainview/index.html",
			"dist/assets": "views/mainview/assets",
			drizzle: "drizzle",
			"node_modules/css-tree/data/patch.json": "data/patch.json",
			"node_modules/css-tree/package.json": "package.json",
			"node_modules/mdn-data/css/at-rules.json":"node_modules/mdn-data/css/at-rules.json",
			"node_modules/mdn-data/css/properties.json":"node_modules/mdn-data/css/properties.json",
			"node_modules/mdn-data/css/syntaxes.json":"node_modules/mdn-data/css/syntaxes.json",
			"node_modules/jsdom/package.json": "node_modules/jsdom/package.json",
		},
		// Ignore Vite output in watch mode — HMR handles view rebuilds separately
		watchIgnore: ["dist/**"],
		mac: {
			bundleCEF: false,
		},
		linux: {
			icon: "assets/icon.ico",
			bundleCEF: false,
		},
		win: {
			icon: "assets/icon.ico",
			bundleCEF: false,
		},
	},
} satisfies ElectrobunConfig;
