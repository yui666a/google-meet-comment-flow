import type { ExtractedComment } from "./types";

// Google Meet が Google Chat ベースのチャットに移行した後の構造:
//   div[jsname="yoHpJ"]                           ← チャットコンテナ
//     └── c-wiz[data-is-user-topic="true"]        ← メッセージトピック
//           ├── span[jsname="oU6v8b"][data-name]  ← 投稿者名
//           └── div[jsname="bgckF"]               ← メッセージ本文
const GCHAT_SELECTORS = {
	container: 'div[jsname="yoHpJ"]',
	messageThread: 'c-wiz[data-is-user-topic="true"]',
	messageText: 'div[jsname="bgckF"]',
	author: 'span[jsname="oU6v8b"]',
} as const;

// 同じトピック ID を複数回拾わないための module-local state
let lastSeenTopicId = "";

export const extractFromGoogleChat = (): ExtractedComment | undefined => {
	const container = document.querySelector(GCHAT_SELECTORS.container);
	if (!container) return;

	const topics = container.querySelectorAll(GCHAT_SELECTORS.messageThread);
	if (topics.length === 0) return;

	const lastTopic = topics[topics.length - 1];
	const topicId = lastTopic.getAttribute("data-topic-id");
	if (!topicId || topicId === lastSeenTopicId) return;
	lastSeenTopicId = topicId;

	const messageEl = lastTopic.querySelector(GCHAT_SELECTORS.messageText);
	const message = messageEl?.textContent?.trim();
	if (!message) return;

	const authorEl = lastTopic.querySelector(GCHAT_SELECTORS.author);
	const author = authorEl?.getAttribute("data-name") ?? undefined;

	return { message, author };
};
