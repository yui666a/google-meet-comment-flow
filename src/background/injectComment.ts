// NOTE: この関数は chrome.scripting.executeScript により対象タブのページコンテキストで実行される。
//       そのためトップレベル import に依存できず、定数・係数テーブル・デフォルト値はすべて
//       呼び出し側 (background handler) から引数として渡す必要がある。
export const injectComment = async (
	message: string,
	author: string,
	commentId: number,
	fontSizeCoefficients: Record<string, number>,
	defaultFontSizeCoefficient: number,
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
		const coefficient = fontSizeCoefficients[key] ?? defaultFontSizeCoefficient;
		return screenHeightPx * BASE_FONT_SIZE_RATIO * coefficient;
	};

	type LanePlacement = { topPx: number; laneIndex: number | null };

	// NOTE: document.querySelectorAll で現在表示中のコメント要素を参照する副作用を持つ。
	//       呼び出し側で配置前タイミングに限定すること。
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

	const createCommentElement = (
		parent: HTMLElement,
		text: string,
	): HTMLElement => {
		const el = document.createElement("span");
		el.textContent = text;
		el.setAttribute("class", COMMENT_CLASS);
		parent.appendChild(el);
		return el;
	};

	const placeComment = (
		el: HTMLElement,
		fontSizePx: number,
		screenWidthPx: number,
		screenHeightPx: number,
		storedColor: string | undefined,
	) => {
		const availableHeightPx = screenHeightPx - FOOTER_HEIGHT_PX;
		const scrollTopPx = window.pageYOffset;
		const { topPx, laneIndex } = pickLanePlacement(
			fontSizePx,
			availableHeightPx,
			scrollTopPx,
		);
		if (laneIndex !== null) {
			el.setAttribute(LANE_ATTR, String(laneIndex));
		}
		applyCommentStyles(
			el,
			screenWidthPx,
			topPx,
			fontSizePx,
			resolveColor(storedColor),
		);
	};

	const startAnimation = (
		el: HTMLElement,
		screenWidthPx: number,
		parent: HTMLElement,
	) => {
		const animation = animateComment(el, screenWidthPx);

		// アニメーション完了時に DOM 除去と storage 削除を行う。
		// `ready` (アニメ開始時) ではなく `finish` で削除することで、
		//  - 他タブが同じ storage を購読している場合の取りこぼし
		//  - アニメ途中での storage 書き換えによる副作用
		//  を防ぐ。
		// commentId 一致チェックは handler 側で行うため、連続投稿時の誤削除は起きない。
		animation.onfinish = () => {
			parent.removeChild(el);
			chrome.runtime.sendMessage({ method: "deleteComment", commentId });
		};
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

	const commentEl = createCommentElement(targetNode, message);
	placeComment(
		commentEl,
		fontSizePx,
		screenWidthPx,
		screenHeightPx,
		storedColor,
	);
	startAnimation(commentEl, screenWidthPx, targetNode);
};
