import { STORAGE_KEYS } from "../shared/storageKeys";
import { extractFromGoogleChat } from "./extractors/googleChat";
import { extractFromLegacyChat } from "./extractors/legacyChat";
import type { CommentExtractor } from "./extractors/types";
import { decodeHtmlEntities } from "./utils/decodeHtmlEntities";

// 新 Google Chat 統合型を優先し、検出できなければ旧チャットにフォールバック
const EXTRACTORS: readonly CommentExtractor[] = [
	extractFromGoogleChat,
	extractFromLegacyChat,
];

const extractLatestComment = () => {
	for (const extract of EXTRACTORS) {
		const extracted = extract();
		if (extracted) return extracted;
	}
	return undefined;
};

const hasElementAddedNode = (mutations: MutationRecord[]): boolean =>
	mutations.some((m) =>
		Array.from(m.addedNodes).some((n) => n.nodeType === Node.ELEMENT_NODE),
	);

// mutation 毎に sendMessage すると高頻度時に round-trip が詰まり、
// await 中の並走で同一コメントを重複送信するレースも起きうるため、
// フラグは module-local にキャッシュし storage.onChanged で同期する。
let isEnabledStreamingCache = false;

const initStreamingFlagCache = async () => {
	try {
		const stored = await chrome.storage.local.get([
			STORAGE_KEYS.IsEnabledStreaming,
		]);
		const value = stored[STORAGE_KEYS.IsEnabledStreaming];
		isEnabledStreamingCache = value === true;
	} catch (e) {
		console.error(e);
	}
};

chrome.storage.onChanged.addListener((changes) => {
	const change = changes[STORAGE_KEYS.IsEnabledStreaming];
	if (!change) return;
	isEnabledStreamingCache = change.newValue === true;
});

const observer = new MutationObserver((mutations) => {
	try {
		if (!chrome.runtime?.id) {
			observer.disconnect();
			return;
		}

		if (!isEnabledStreamingCache) return;
		if (!hasElementAddedNode(mutations)) return;

		const extracted = extractLatestComment();
		if (!extracted) return;

		chrome.runtime
			.sendMessage({
				method: "setComment",
				value: decodeHtmlEntities(extracted.message),
				author: extracted.author,
			})
			.catch((e) => console.error(e));
	} catch (e) {
		console.error(e);
	}
});

const startObserving = () => {
	initStreamingFlagCache();
	observer.observe(document.body, { subtree: true, childList: true });
};

if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", startObserving);
} else {
	startObserving();
}
