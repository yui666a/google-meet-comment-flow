export type ExtractedComment = {
	message: string;
	author: string | undefined;
};

export type CommentExtractor = () => ExtractedComment | undefined;
