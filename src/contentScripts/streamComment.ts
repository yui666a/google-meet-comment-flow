import { STORAGE_KEYS } from "../shared/storageKeys";

chrome.storage.onChanged.addListener((changes) => {
	if (!changes[STORAGE_KEYS.Comment]?.newValue) return;
	chrome.runtime.sendMessage({ method: "flushComment" });
});
