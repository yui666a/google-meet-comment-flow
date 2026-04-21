// injectComment から切り出した純粋ロジック。
// DOM / chrome API に依存しないため、vitest で単体テスト可能。
//
// NOTE: このモジュールは background (bundled) からも参照されるが、
//       executeScript で注入される側 (injectComment) からは
//       トップレベル import できない。呼び出し側で同等の実装を再現するか、
//       args 経由で計算結果のみを渡す設計とする。

// 画面高さに対するフォントサイズ基準
export const BASE_FONT_SIZE_RATIO = 0.05;
// フォントサイズに対するレーン間隔
const LANE_GAP_RATIO = 0.2;

export const resolveFontSizePx = (
	screenHeightPx: number,
	key: string,
	coefficients: Record<string, number>,
	defaultCoefficient: number,
): number => {
	const coefficient = coefficients[key] ?? defaultCoefficient;
	return screenHeightPx * BASE_FONT_SIZE_RATIO * coefficient;
};

// ユーザー名を HSL の hue に変換して、投稿者ごとに安定した色を割り当てる。
// 見た目の色分けのための簡易ハッシュで厳密な一様分布は狙っていない。
export const usernameToColor = (username: string): string => {
	let hash = 0;
	for (let i = 0; i < username.length; i++) {
		hash = username.charCodeAt(i) + ((hash << 5) - hash);
		hash = hash & hash;
	}
	const hue = Math.abs(hash) % 360;
	return `hsl(${hue}, 70%, 60%)`;
};

export const resolveColor = (
	author: string,
	storedColor: string | undefined,
	defaultColor: string,
): string => {
	if (author) return usernameToColor(author);
	return storedColor || defaultColor;
};

// 占有レーン集合を受け取り、空きがあればランダムに 1 つ選ぶ。
// 全レーン占有時は null を返し、呼び出し側でフォールバックする。
export const pickFreeLane = (
	laneCount: number,
	occupiedLanes: ReadonlySet<number>,
	random: () => number = Math.random,
): number | null => {
	const freeLanes: number[] = [];
	for (let i = 0; i < laneCount; i++) {
		if (!occupiedLanes.has(i)) freeLanes.push(i);
	}
	if (freeLanes.length === 0) return null;
	return freeLanes[Math.floor(random() * freeLanes.length)];
};

export const computeLaneLayout = (
	fontSizePx: number,
	availableHeightPx: number,
): { laneHeightPx: number; laneCount: number } => {
	const laneHeightPx = fontSizePx + fontSizePx * LANE_GAP_RATIO;
	const laneCount = Math.max(1, Math.floor(availableHeightPx / laneHeightPx));
	return { laneHeightPx, laneCount };
};
