// NOTE: この関数は chrome.scripting.executeScript により対象タブのページコンテキストで実行される。
//       そのためトップレベル import に依存できず、定数や helper もすべて関数内に閉じ込める必要がある。
export const injectComment = async (
	message: string,
	author: string,
	commentId: number,
) => {
	// --- 定数 ---
	const SPEED_PX_PER_SEC = 400;
	const FOOTER_HEIGHT_PX = 88;
	const BASE_FONT_SIZE_RATIO = 0.05; // 画面高さに対するフォントサイズ基準
	const LANE_GAP_RATIO = 0.2; // フォントサイズに対するレーン間隔
	const DEFAULT_COLOR = "green";
	const COMMENT_CLASS = "google-meet-comment-flow";
	const LANE_ATTR = "data-lane";
	const MAX_Z_INDEX = "2147483647";
	const FONT_SIZE_COEFFICIENTS: Record<string, number> = {
		XS: 0.25,
		S: 0.5,
		M: 1,
		L: 2,
		XL: 4,
	};
	const DEFAULT_FONT_SIZE_COEFFICIENT = FONT_SIZE_COEFFICIENTS.L;

	// --- helpers ---
	// Google Slide の全画面モードでは最大 z-index の overlay が存在するため、
	// そちらに追加しないとコメントが埋もれる。
	const resolveTargetNode = (): HTMLElement => {
		const fullScreenOverlay = document.querySelector<HTMLElement>(
			"body > div.punch-full-screen-element.punch-full-window-overlay",
		);
		return fullScreenOverlay ?? document.body;
	};

	const resolveFontSizePx = (screenHeightPx: number, key: string): number => {
		const coefficient =
			FONT_SIZE_COEFFICIENTS[key] ?? DEFAULT_FONT_SIZE_COEFFICIENT;
		return screenHeightPx * BASE_FONT_SIZE_RATIO * coefficient;
	};

	type LanePlacement = { topPx: number; laneIndex: number | null };

	const pickLanePlacement = (
		fontSizePx: number,
		availableHeightPx: number,
		scrollTopPx: number,
	): LanePlacement => {
		const laneHeightPx = fontSizePx + fontSizePx * LANE_GAP_RATIO;
		const laneCount = Math.max(1, Math.floor(availableHeightPx / laneHeightPx));

		const occupiedLanes = new Set(
			Array.from(document.querySelectorAll(`.${COMMENT_CLASS}[${LANE_ATTR}]`))
				.map((el) => Number(el.getAttribute(LANE_ATTR)))
				.filter((n) => Number.isFinite(n)),
		);

		const freeLanes = Array.from({ length: laneCount }, (_, i) => i).filter(
			(i) => !occupiedLanes.has(i),
		);

		if (freeLanes.length > 0) {
			const laneIndex = freeLanes[Math.floor(Math.random() * freeLanes.length)];
			return { topPx: scrollTopPx + laneIndex * laneHeightPx, laneIndex };
		}

		// 全レーン占有時はランダムフォールバック
		const fallbackTopPx =
			scrollTopPx +
			Math.floor((availableHeightPx - fontSizePx) * Math.random());
		return { topPx: fallbackTopPx, laneIndex: null };
	};

	// ユーザー名を HSL の hue に変換して、投稿者ごとに安定した色を割り当てる
	const usernameToColor = (username: string): string => {
		let hash = 0;
		for (let i = 0; i < username.length; i++) {
			hash = username.charCodeAt(i) + ((hash << 5) - hash);
			hash = hash & hash;
		}
		const hue = Math.abs(hash) % 360;
		return `hsl(${hue}, 70%, 60%)`;
	};

	const resolveColor = (storedColor: string | undefined): string => {
		if (author) return usernameToColor(author);
		return storedColor || DEFAULT_COLOR;
	};

	const applyCommentStyles = (
		el: HTMLElement,
		leftPx: number,
		topPx: number,
		fontSizePx: number,
		color: string,
	) => {
		el.style.position = "absolute";
		el.style.left = `${leftPx}px`;
		el.style.top = `${topPx}px`;
		el.style.fontSize = `${fontSizePx}px`;
		el.style.color = color;
		el.style.zIndex = MAX_Z_INDEX;
		el.style.whiteSpace = "nowrap";
		el.style.lineHeight = "initial";
	};

	const animateComment = (
		el: HTMLElement,
		screenWidthPx: number,
	): Animation => {
		const travelDistancePx = screenWidthPx + el.offsetWidth;
		const durationMs = (travelDistancePx / SPEED_PX_PER_SEC) * 1000;

		return el.animate(
			{ left: `${-el.offsetWidth}px` },
			{ duration: durationMs, easing: "linear" },
		);
	};

	// --- main flow ---
	const screenHeightPx = window.innerHeight;
	const screenWidthPx = window.innerWidth;

	const [storedFontSize, storedColor] = await Promise.all([
		chrome.runtime.sendMessage({ method: "getFontSize" }),
		chrome.runtime.sendMessage({ method: "getColor" }),
	]);

	const targetNode = resolveTargetNode();
	const fontSizePx = resolveFontSizePx(screenHeightPx, storedFontSize);

	const commentEl = document.createElement("span");
	commentEl.textContent = message;
	commentEl.setAttribute("class", COMMENT_CLASS);
	targetNode.appendChild(commentEl);

	const availableHeightPx = screenHeightPx - FOOTER_HEIGHT_PX;
	const scrollTopPx = window.pageYOffset;
	const { topPx, laneIndex } = pickLanePlacement(
		fontSizePx,
		availableHeightPx,
		scrollTopPx,
	);
	if (laneIndex !== null) {
		commentEl.setAttribute(LANE_ATTR, String(laneIndex));
	}

	applyCommentStyles(
		commentEl,
		screenWidthPx,
		topPx,
		fontSizePx,
		resolveColor(storedColor),
	);

	const animation = animateComment(commentEl, screenWidthPx);

	// 表示中の commentId と一致する場合のみ storage から削除し、
	// 連続投稿時に新しいコメントを誤削除するのを防ぐ。
	animation.ready.then(() =>
		chrome.runtime.sendMessage({ method: "deleteComment", commentId }),
	);

	animation.onfinish = () => {
		targetNode.removeChild(commentEl);
	};
};
