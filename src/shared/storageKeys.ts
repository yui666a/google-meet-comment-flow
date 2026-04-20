export const STORAGE_KEYS = {
	Comment: "comment",
	CommentAuthor: "commentAuthor",
	CommentId: "commentId",
	Color: "color",
	FontSize: "fontSize",
	IsEnabledStreaming: "isEnabledStreaming",
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];
