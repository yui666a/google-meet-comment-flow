export type SetCommentRequest = {
	method: "setComment";
	value: string;
	author?: string;
};

export type DeleteCommentRequest = {
	method: "deleteComment";
	commentId: number;
};

export type FlushCommentRequest = {
	method: "flushComment";
};

export type SetColorRequest = { method: "setColor"; value: string };
export type GetColorRequest = { method: "getColor" };

export type SetFontSizeRequest = { method: "setFontSize"; value: string };
export type GetFontSizeRequest = { method: "getFontSize" };

export type SetIsEnabledStreamingRequest = {
	method: "setIsEnabledStreaming";
	value: boolean;
};
export type GetIsEnabledStreamingRequest = {
	method: "getIsEnabledStreaming";
};

export type MessageRequest =
	| SetCommentRequest
	| DeleteCommentRequest
	| FlushCommentRequest
	| SetColorRequest
	| GetColorRequest
	| SetFontSizeRequest
	| GetFontSizeRequest
	| SetIsEnabledStreamingRequest
	| GetIsEnabledStreamingRequest;
