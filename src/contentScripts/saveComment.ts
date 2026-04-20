import { decodeHTMLSpecialWord } from "./utils/decodeHTMLSpecialWord";

let prevThread: Node;

let prevPopupThread: Node;

// --- 旧エフェメラルチャット用セレクタ ---
const CHAT_SELECTOR_BASE = "div.WUFI9b[data-panel-id='2']";

const CHAT_SELECTOR_OBJ = {
	container: CHAT_SELECTOR_BASE,
	thread: `${CHAT_SELECTOR_BASE} > div.hWX4r div.z38b6`,
	message: `${CHAT_SELECTOR_BASE} > div.hWX4r div.z38b6 div[jsname="dTKtvb"] > div`,
} as const;

const CHAT_CLASS_OBJ = {
	isHidden: "qdulke",
} as const;

const POPUP_SELECTOR_BASE = "div.fJsklc.nulMpf.Didmac.sOkDId";

const POPUP_SELECTOR_OBJ = {
	container: POPUP_SELECTOR_BASE,
	thread: `${POPUP_SELECTOR_BASE} > div.mIw6Bf.nTlZFe.P9KVBf`,
	message: `${POPUP_SELECTOR_BASE} > div.mIw6Bf.nTlZFe.P9KVBf div[jsname="dTKtvb"] > div`,
} as const;

// --- 新 Google Chat 統合型チャット用セレクタ ---
// Google Meet が Google Chat ベースのチャットに移行したため、
// jsname 属性ベースのセレクタで安定的にメッセージを取得する。
//
// 構造:
//   div[jsname="yoHpJ"]                           ← チャットコンテナ
//     └── c-wiz[data-is-user-topic="true"]        ← メッセージトピック
//           ├── span[jsname="oU6v8b"][data-name]  ← 投稿者名
//           └── div[jsname="bgckF"]               ← メッセージ本文
const GCHAT_SELECTOR_OBJ = {
	container: 'div[jsname="yoHpJ"]',
	messageThread: 'c-wiz[data-is-user-topic="true"]',
	messageText: 'div[jsname="bgckF"]',
	author: 'span[jsname="oU6v8b"]',
} as const;

let lastGChatTopicId = "";

type ExtractedComment = {
	message: string;
	author: string | undefined;
};

/**
 * Google Chat 統合型チャットから最新メッセージを取得する。
 * data-topic-id で重複検知を行う。
 */
const extractMessageFromGChat = (
	container: Element | null,
): ExtractedComment | undefined => {
	if (!container) return;

	const topics = container.querySelectorAll(GCHAT_SELECTOR_OBJ.messageThread);
	if (topics.length === 0) return;

	const lastTopic = topics[topics.length - 1];
	const topicId = lastTopic.getAttribute("data-topic-id");

	if (!topicId || topicId === lastGChatTopicId) return;
	lastGChatTopicId = topicId;

	const messageEl = lastTopic.querySelector(GCHAT_SELECTOR_OBJ.messageText);
	if (!messageEl) return;

	const message = messageEl.textContent?.trim();
	if (!message) return;

	const authorEl = lastTopic.querySelector(GCHAT_SELECTOR_OBJ.author);
	const author = authorEl?.getAttribute("data-name") ?? undefined;

	return { message, author };
};

/**
 * メッセージノードの祖先を辿り、投稿者名を取得する（旧チャット用）。
 * クラス名は変更されやすいため、jsname 属性を基準にDOMを探索する。
 *
 * 構造:
 *   div[jsname="Ypafjf"]  ← メッセージグループ
 *     └── ... > div (ヘッダー)
 *           ├── div  ← 投稿者名（自分のメッセージでは存在しない）
 *           └── div[jsname="biJjHb"]  ← タイムスタンプ
 */
const extractAuthorFromMessageNode = (
	messageNode: Element,
): string | undefined => {
	const messageGroup = messageNode.closest('[jsname="Ypafjf"]');
	if (!messageGroup) return undefined;

	// タイムスタンプ要素の親（ヘッダー）内で、タイムスタンプ以外のテキスト要素を探す
	const timestampEl = messageGroup.querySelector('[jsname="biJjHb"]');
	if (!timestampEl?.parentElement) return undefined;

	for (const sibling of Array.from(timestampEl.parentElement.children)) {
		if (sibling === timestampEl) continue;
		const text = sibling.textContent?.trim();
		if (text) return text;
	}

	return undefined;
};

const extractMessageFromPopupThread = (
	popupThread: Element | null,
): ExtractedComment | undefined => {
	if (!popupThread || popupThread.isEqualNode(prevPopupThread)) return;

	prevPopupThread = popupThread.cloneNode(true);

	const messageNodes = popupThread.querySelectorAll(POPUP_SELECTOR_OBJ.message);

	if (messageNodes.length === 0) return;

	const messageNode = messageNodes[messageNodes.length - 1];
	const author = extractAuthorFromMessageNode(messageNode);

	return { message: messageNode.innerHTML, author };
};

const extractMessageFromThread = (
	thread: Element | null,
): ExtractedComment | undefined => {
	if (!thread || thread.isEqualNode(prevThread)) return;

	prevThread = thread.cloneNode(true);

	const messageNodes = thread.querySelectorAll(CHAT_SELECTOR_OBJ.message);

	if (messageNodes.length === 0) return;

	const messageNode = messageNodes[messageNodes.length - 1];
	const author = extractAuthorFromMessageNode(messageNode);

	return { message: messageNode.innerHTML, author };
};

const observer = new MutationObserver(async (mutations: MutationRecord[]) => {
	try {
		if (!chrome.runtime?.id) {
			observer.disconnect();
			return;
		}

		const addedNode = mutations[0].addedNodes?.[0];

		if (addedNode?.nodeType !== Node.ELEMENT_NODE) return;

		const isEnabledStreaming = await chrome.runtime.sendMessage({
			method: "getIsEnabledStreaming",
		});

		if (!isEnabledStreaming) return;

		// 新 Google Chat 統合型チャットを優先して検出
		const gChatContainer = document.querySelector(GCHAT_SELECTOR_OBJ.container);
		let extracted = extractMessageFromGChat(gChatContainer);

		// 旧エフェメラルチャットにフォールバック
		if (!extracted) {
			const popupThread = document.querySelector(POPUP_SELECTOR_OBJ.thread);

			const chatPanel = document.querySelector(CHAT_SELECTOR_OBJ.container);
			const chatPanelAside = chatPanel?.closest("aside.R3Gmyc");
			const isChatVisible =
				chatPanelAside &&
				!chatPanelAside.classList.contains(CHAT_CLASS_OBJ.isHidden);
			const thread = document.querySelector(CHAT_SELECTOR_OBJ.thread);

			extracted = isChatVisible
				? extractMessageFromThread(thread)
				: extractMessageFromPopupThread(popupThread);
		}

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

document.addEventListener("DOMContentLoaded", () =>
	observer.observe(document.body, {
		subtree: true,
		childList: true,
	}),
);
