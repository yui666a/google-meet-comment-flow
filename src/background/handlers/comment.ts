import { STORAGE_KEYS } from "../../shared/storageKeys";
import { injectComment } from "../injectComment";

export const setComment = async (value: string, author?: string) => {
	// author が未指定のときは前回値が残らないよう明示的にクリアする
	await chrome.storage.local.set({
		[STORAGE_KEYS.Comment]: value,
		[STORAGE_KEYS.CommentId]: Date.now(),
		[STORAGE_KEYS.CommentAuthor]: author ?? "",
	});
};

// 指定された commentId と一致する場合のみコメントを削除する（連続投稿時のレース防止）
export const deleteCommentIfCurrent = async (commentId: number) => {
	const stored = await chrome.storage.local.get([STORAGE_KEYS.CommentId]);
	if (stored[STORAGE_KEYS.CommentId] !== commentId) return;

	await chrome.storage.local.remove([
		STORAGE_KEYS.Comment,
		STORAGE_KEYS.CommentAuthor,
		STORAGE_KEYS.CommentId,
	]);
};

export const flushCommentToActiveTab = async () => {
	const stored = await chrome.storage.local.get([
		STORAGE_KEYS.Comment,
		STORAGE_KEYS.CommentAuthor,
		STORAGE_KEYS.CommentId,
	]);

	const comment = stored[STORAGE_KEYS.Comment];
	if (!comment) return;

	const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
	if (!tab?.id) return;

	await chrome.scripting.executeScript({
		target: { tabId: tab.id },
		func: injectComment,
		args: [
			String(comment),
			String(stored[STORAGE_KEYS.CommentAuthor] ?? ""),
			Number(stored[STORAGE_KEYS.CommentId] ?? 0),
		],
	});
};
