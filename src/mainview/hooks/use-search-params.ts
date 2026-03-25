import { useSyncExternalStore } from "react";

const LOCATION_CHANGE_EVENT = "pi:location-change";

let historyPatched = false;

function notifyLocationChange() {
	window.dispatchEvent(new Event(LOCATION_CHANGE_EVENT));
}

function patchHistory() {
	if (historyPatched || typeof window === "undefined") {
		return;
	}

	historyPatched = true;

	const originalPushState = window.history.pushState;
	const originalReplaceState = window.history.replaceState;

	window.history.pushState = function (...args) {
		const result = originalPushState.apply(this, args);
		notifyLocationChange();
		return result;
	};

	window.history.replaceState = function (...args) {
		const result = originalReplaceState.apply(this, args);
		notifyLocationChange();
		return result;
	};
}

function subscribe(onStoreChange: () => void) {
	if (typeof window === "undefined") {
		return () => {};
	}

	patchHistory();

	window.addEventListener("popstate", onStoreChange);
	window.addEventListener(LOCATION_CHANGE_EVENT, onStoreChange);

	return () => {
		window.removeEventListener("popstate", onStoreChange);
		window.removeEventListener(LOCATION_CHANGE_EVENT, onStoreChange);
	};
}

function getSnapshot() {
	if (typeof window === "undefined") {
		return "";
	}
	return window.location.search;
}

export function useSearchParamsString() {
	return useSyncExternalStore(subscribe, getSnapshot, () => "");
}

export function useSearchParams() {
	const search = useSearchParamsString();
	return new URLSearchParams(search);
}
