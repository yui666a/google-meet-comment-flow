import type { CommentExtractor, ExtractedComment } from "./types";

// 旧エフェメラルチャット（チャットパネル）
const LEGACY_PANEL_BASE = "div.WUFI9b[data-panel-id='2']";
const LEGACY_PANEL_SELECTORS = {
	container: LEGACY_PANEL_BASE,
	thread: `${LEGACY_PANEL_BASE} > div.hWX4r div.z38b6`,
	message: `${LEGACY_PANEL_BASE} > div.hWX4r div.z38b6 div[jsname="dTKtvb"] > div`,
	hiddenClass: "qdulke",
	asideClass: "aside.R3Gmyc",
} as const;

// 旧ポップアップチャット（会議中の吹き出し表示）
const LEGACY_POPUP_BASE = "div.fJsklc.nulMpf.Didmac.sOkDId";
const LEGACY_POPUP_SELECTORS = {
	thread: `${LEGACY_POPUP_BASE} > div.mIw6Bf.nTlZFe.P9KVBf`,
	message: `${LEGACY_POPUP_BASE} > div.mIw6Bf.nTlZFe.P9KVBf div[jsname="dTKtvb"] > div`,
} as const;

// jsname="Ypafjf" = メッセージグループ、jsname="biJjHb" = タイムスタンプ
// タイムスタンプの兄弟に投稿者名があるが、自分のメッセージには存在しない
const extractAuthorFromMessageNode = (
	messageNode: Element,
): string | undefined => {
	const messageGroup = messageNode.closest('[jsname="Ypafjf"]');
	if (!messageGroup) return undefined;

	const timestampEl = messageGroup.querySelector('[jsname="biJjHb"]');
	if (!timestampEl?.parentElement) return undefined;

	for (const sibling of Array.from(timestampEl.parentElement.children)) {
		if (sibling === timestampEl) continue;
		const text = sibling.textContent?.trim();
		if (text) return text;
	}
	return undefined;
};

// スレッド要素の差分を検出しつつ最新メッセージを返す抽出器を生成する factory。
// 旧チャットと旧ポップアップは構造が似ているためセレクタ差し替えで共通化できる。
const createThreadExtractor = (
	getThread: () => Element | null,
	messageSelector: string,
): CommentExtractor => {
	let lastSnapshot: Node | undefined;

	return (): ExtractedComment | undefined => {
		const thread = getThread();
		if (!thread || thread.isEqualNode(lastSnapshot ?? null)) return;

		lastSnapshot = thread.cloneNode(true);

		const messageNodes = thread.querySelectorAll(messageSelector);
		if (messageNodes.length === 0) return;

		const messageNode = messageNodes[messageNodes.length - 1];
		const author = extractAuthorFromMessageNode(messageNode);

		return { message: messageNode.innerHTML, author };
	};
};

const isLegacyChatPanelVisible = (): boolean => {
	const panel = document.querySelector(LEGACY_PANEL_SELECTORS.container);
	const aside = panel?.closest(LEGACY_PANEL_SELECTORS.asideClass);
	return (
		!!aside && !aside.classList.contains(LEGACY_PANEL_SELECTORS.hiddenClass)
	);
};

const extractFromLegacyPanel = createThreadExtractor(
	() => document.querySelector(LEGACY_PANEL_SELECTORS.thread),
	LEGACY_PANEL_SELECTORS.message,
);

const extractFromLegacyPopup = createThreadExtractor(
	() => document.querySelector(LEGACY_POPUP_SELECTORS.thread),
	LEGACY_POPUP_SELECTORS.message,
);

export const extractFromLegacyChat: CommentExtractor = () => {
	return isLegacyChatPanelVisible()
		? extractFromLegacyPanel()
		: extractFromLegacyPopup();
};
