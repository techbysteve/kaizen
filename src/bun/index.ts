/**
 * Kaizen Desktop - Main Process Entry Point
 */

import {
	BrowserWindow,
	BrowserView,
	Updater,
	type RPCSchema,
} from "electrobun/bun";
import { runDrizzleMigrations } from "./database/client";
import { rpcHandlers } from "./rpc";
import type { KaizenRPCSchema } from "../types/rpc";

const DEV_SERVER_PORT = 5173;
const DEV_SERVER_URL = `http://localhost:${DEV_SERVER_PORT}`;
const RPC_MAX_REQUEST_TIME_MS = 120_000;

// Check if Vite dev server is running for HMR
async function getMainViewUrl(): Promise<string> {
	const channel = await Updater.localInfo.channel();
	if (channel === "dev") {
		try {
			await fetch(DEV_SERVER_URL, { method: "HEAD" });
			console.log(`HMR enabled: Using Vite dev server at ${DEV_SERVER_URL}`);
			return DEV_SERVER_URL;
		} catch {
			console.log(
				"Vite dev server not running. Run 'bun run dev:hmr' for HMR support.",
			);
		}
	}
	return "views://mainview/index.html";
}

// Type for bun side RPC (with RPCSchema wrapper)
type KaizenRPC = {
	bun: RPCSchema<KaizenRPCSchema["bun"]>;
	webview: RPCSchema<KaizenRPCSchema["webview"]>;
};

const rpc = BrowserView.defineRPC<KaizenRPC>({
	maxRequestTime: RPC_MAX_REQUEST_TIME_MS,
	handlers: {
		requests: rpcHandlers,
		messages: {
			logToBun: (payload) => {
				console.log("[Browser]", payload.params.msg);
			},
		},
	},
});

console.log("Starting DB migrations")

runDrizzleMigrations();

const url = await getMainViewUrl();

const mainWindow = new BrowserWindow({
	title: "Kaizen - Your Personal Library",
	url,
	frame: {
		width: 1200,
		height: 800,
		x: 100,
		y: 100,
	},
	rpc,
	titleBarStyle: "default",
});

mainWindow.webview.on("dom-ready", () => {
	mainWindow.webview.executeJavascript(`
		document.addEventListener("contextmenu", (event) => {
			event.preventDefault();
		});
	`);
});

console.log("Kaizen desktop app started!");
console.log("Window created with URL:", url);
console.log("Window id:", mainWindow.id);
