import type { Color, FontSize } from "./settings";

export type SettingsPayload = {
	color: Color | undefined;
	fontSize: FontSize | undefined;
	isEnabledStreaming: boolean | undefined;
};

// 外部から参照されるのは MessageRequest (discriminated union) と
// getSettings のレスポンス型 SettingsPayload のみ。
// 個別の Request 型は union の要素として inline 定義し、method 文字列を
// 一覧できる形に保つ。
export type MessageRequest =
	| { method: "setComment"; value: string; author?: string }
	| { method: "deleteComment"; commentId: number }
	| { method: "flushComment" }
	| { method: "setColor"; value: Color }
	| { method: "getColor" }
	| { method: "setFontSize"; value: FontSize }
	| { method: "getFontSize" }
	| { method: "setIsEnabledStreaming"; value: boolean }
	| { method: "getIsEnabledStreaming" }
	| { method: "getSettings" };
