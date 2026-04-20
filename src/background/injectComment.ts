export const injectComment = async (
	message: string,
	author: string,
	commentId: number,
) => {
	const screenHeight = window.innerHeight;
	const screenWidth = window.innerWidth;

	const comment = document.createElement("span");

	comment.textContent = message;

	// NOTE: google slide full screen mode element
	const gSlideContentNode = document.querySelector(
		"body > div.punch-full-screen-element.punch-full-window-overlay",
	);

	/*
  NOTE: When the focused tab is on google slide full screen mode,
        target node is the specific div, whose z-index is max value
        as the same as the value of streamed comments

  SEE: https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Positioning/Understanding_z_index/The_stacking_context
  */
	const targetNode = gSlideContentNode || document.body;

	targetNode.appendChild(comment);

	const storedFontSizeMessage = await chrome.runtime.sendMessage({
		method: "getFontSize",
	});

	const letterSizeCoefficient = () => {
		switch (storedFontSizeMessage) {
			case "XS":
				return 0.25;
			case "S":
				return 0.5;
			case "M":
				return 1;
			case "L":
				return 2;
			case "XL":
				return 4;
			default:
				return 2;
		}
	};

	const letterSize = screenHeight * 0.05 * letterSizeCoefficient();
	comment.setAttribute("class", "google-meet-comment-flow");

	const footerHeight = 88;
	const scrollTopHeight = window.pageYOffset;
	const availableHeight = screenHeight - footerHeight;

	// レーン計算
	const laneGap = letterSize * 0.2;
	const laneHeight = letterSize + laneGap;
	const laneCount = Math.max(1, Math.floor(availableHeight / laneHeight));

	// DOM 上の既存コメント要素から占有中のレーンを取得
	const occupiedLanes = new Set(
		Array.from(
			document.querySelectorAll(".google-meet-comment-flow[data-lane]"),
		).map((el) => Number(el.getAttribute("data-lane"))),
	);

	// 空きレーンからランダムに選択
	const freeLanes = Array.from({ length: laneCount }, (_, i) => i).filter(
		(i) => !occupiedLanes.has(i),
	);

	let topPosition: number;
	let selectedLane: number | null = null;

	if (freeLanes.length > 0) {
		selectedLane = freeLanes[Math.floor(Math.random() * freeLanes.length)];
		topPosition = scrollTopHeight + selectedLane * laneHeight;
	} else {
		// 全レーン占有時：従来通りランダム配置
		topPosition =
			scrollTopHeight +
			Math.floor((availableHeight - letterSize) * Math.random());
	}

	if (selectedLane !== null) {
		comment.setAttribute("data-lane", String(selectedLane));
	}

	const commentStyle = {
		left: `${screenWidth}px`,
		top: `${topPosition}px`,
		fontSize: `${letterSize}px`,
	};

	const storedColorMessage = await chrome.runtime.sendMessage({
		method: "getColor",
	});

	// ユーザー名からハッシュ値を計算し、HSL色空間で色を決定する
	const usernameToColor = (username: string): string => {
		let hash = 0;
		for (let i = 0; i < username.length; i++) {
			hash = username.charCodeAt(i) + ((hash << 5) - hash);
			hash = hash & hash;
		}
		const hue = Math.abs(hash) % 360;
		return `hsl(${hue}, 70%, 60%)`;
	};

	const resolveColor = (): string => {
		if (author) {
			return usernameToColor(author);
		}
		return storedColorMessage || "green";
	};

	comment.style.left = commentStyle.left;
	comment.style.top = commentStyle.top;
	comment.style.fontSize = commentStyle.fontSize;

	comment.style.color = resolveColor();

	comment.style.position = "absolute";
	comment.style.zIndex = "2147483647";
	comment.style.whiteSpace = "nowrap";
	comment.style.lineHeight = "initial";

	// 一定速度 (px/sec) で流す。移動距離 = 画面幅 + テキスト幅
	const SPEED_PX_PER_SEC = 400;
	const travelDistance = screenWidth + comment.offsetWidth;
	const duration = (travelDistance / SPEED_PX_PER_SEC) * 1000;

	const streamCommentUI = comment.animate(
		{
			left: `${-comment.offsetWidth}px`,
		},
		{
			duration,
			easing: "linear",
		},
	);

	// NOTE: 表示中の commentId と一致する場合のみ削除する。連続投稿時に
	// 新しいコメントを誤って消さないための安全策。
	streamCommentUI.ready.then(() =>
		chrome.runtime.sendMessage({ method: "deleteComment", commentId }),
	);

	streamCommentUI.onfinish = () => {
		targetNode.removeChild(comment);
	};
};
