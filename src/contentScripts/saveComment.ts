import { extractFromGoogleChat } from "./extractors/googleChat";
import { extractFromLegacyChat } from "./extractors/legacyChat";
import type { CommentExtractor } from "./extractors/types";
import { decodeHTMLSpecialWord } from "./utils/decodeHTMLSpecialWord";

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

const observer = new MutationObserver(async (mutations) => {
	try {
		if (!chrome.runtime?.id) {
			observer.disconnect();
			return;
		}

		if (!hasElementAddedNode(mutations)) return;

		const isEnabledStreaming = await chrome.runtime.sendMessage({
			method: "getIsEnabledStreaming",
		});
		if (!isEnabledStreaming) return;

		const extracted = extractLatestComment();
		if (!extracted) return;

		chrome.runtime.sendMessage({
			method: "setComment",
			value: decodeHTMLSpecialWord(extracted.message),
			author: extracted.author,
		});
	} catch (e) {
		console.error(e);
	}
});

const startObserving = () =>
	observer.observe(document.body, { subtree: true, childList: true });

if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", startObserving);
} else {
	startObserving();
}
