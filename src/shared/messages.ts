import type { Color, FontSize } from "./settings";

// 外部から参照されるのは MessageRequest (discriminated union) のみ。
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
	| { method: "getIsEnabledStreaming" };
