import type { MessageRequest } from "../shared/messages";
import {
	deleteCommentIfMatches,
	flushCommentToFocusedTab,
	setComment,
} from "./handlers/comment";
import {
	getColor,
	getFontSize,
	getIsEnabledStreaming,
	setColor,
	setFontSize,
	setIsEnabledStreaming,
} from "./handlers/settings";

chrome.runtime.onMessage.addListener(
	(request: MessageRequest, _sender, sendResponse) => {
		switch (request.method) {
			case "setComment":
				setComment(request.value, request.author);
				return false;

			case "deleteComment":
				deleteCommentIfMatches(request.commentId);
				return false;

			case "flushComment":
				flushCommentToFocusedTab();
				return false;

			case "setColor":
				setColor(request.value);
				return false;

			case "getColor":
				getColor().then(sendResponse);
				return true;

			case "setFontSize":
				setFontSize(request.value);
				return false;

			case "getFontSize":
				getFontSize().then(sendResponse);
				return true;

			case "setIsEnabledStreaming":
				setIsEnabledStreaming(request.value);
				return false;

			case "getIsEnabledStreaming":
				getIsEnabledStreaming().then(sendResponse);
				return true;

			default: {
				const _exhaustive: never = request;
				console.warn("Unknown message request:", _exhaustive);
				return false;
			}
		}
	},
);
