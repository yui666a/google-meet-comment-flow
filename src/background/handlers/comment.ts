import {
	DEFAULT_FONT_SIZE,
	FONT_SIZE_COEFFICIENTS,
} from "../../shared/settings";
import { STORAGE_KEYS } from "../../shared/storageKeys";
import { injectComment } from "../injectComment";

type StoredCommentPayload = {
	message: string;
	author: string;
	commentId: number;
};

// storage の型は unknown 相当のため、injection に渡す前に値の形状を narrow する。
const readStoredComment = async (): Promise<
	StoredCommentPayload | undefined
> => {
	const stored = await chrome.storage.local.get([
		STORAGE_KEYS.Comment,
		STORAGE_KEYS.CommentAuthor,
		STORAGE_KEYS.CommentId,
	]);

	const message = stored[STORAGE_KEYS.Comment];
	const author = stored[STORAGE_KEYS.CommentAuthor];
	const commentId = stored[STORAGE_KEYS.CommentId];

	if (typeof message !== "string" || message === "") return undefined;
	if (typeof commentId !== "number") return undefined;

	return {
		message,
		author: typeof author === "string" ? author : "",
		commentId,
	};
};

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
	const payload = await readStoredComment();
	if (!payload) return;

	const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
	if (!tab?.id) return;

	await chrome.scripting.executeScript({
		target: { tabId: tab.id },
		func: injectComment,
		args: [
			payload.message,
			payload.author,
			payload.commentId,
			FONT_SIZE_COEFFICIENTS,
			FONT_SIZE_COEFFICIENTS[DEFAULT_FONT_SIZE],
		],
	});
};
