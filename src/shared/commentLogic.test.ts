import { describe, expect, it } from "vitest";
import {
	BASE_FONT_SIZE_RATIO,
	computeLaneLayout,
	pickFreeLane,
	resolveColor,
	resolveFontSizePx,
	usernameToColor,
} from "./commentLogic";

describe("resolveFontSizePx", () => {
	const coefficients = { XS: 0.25, S: 0.5, M: 1, L: 2, XL: 4 };

	it("returns screenHeight * BASE_RATIO * coefficient", () => {
		expect(resolveFontSizePx(1000, "M", coefficients, coefficients.L)).toBe(
			1000 * BASE_FONT_SIZE_RATIO * 1,
		);
		expect(resolveFontSizePx(1000, "XL", coefficients, coefficients.L)).toBe(
			1000 * BASE_FONT_SIZE_RATIO * 4,
		);
	});

	it("falls back to defaultCoefficient when key is unknown", () => {
		expect(
			resolveFontSizePx(1000, "unknown", coefficients, coefficients.L),
		).toBe(1000 * BASE_FONT_SIZE_RATIO * 2);
	});
});

describe("usernameToColor", () => {
	it("is stable for the same username", () => {
		expect(usernameToColor("alice")).toBe(usernameToColor("alice"));
	});

	it("produces a valid hsl() string in the expected shape", () => {
		const color = usernameToColor("bob");
		expect(color).toMatch(/^hsl\(\d{1,3}, 70%, 60%\)$/);
	});

	it("maps empty string to a deterministic color", () => {
		expect(usernameToColor("")).toBe("hsl(0, 70%, 60%)");
	});
});

describe("resolveColor", () => {
	it("prefers usernameToColor when author is present", () => {
		const color = resolveColor("alice", "red", "green");
		expect(color).toBe(usernameToColor("alice"));
	});

	it("returns storedColor when author is empty", () => {
		expect(resolveColor("", "red", "green")).toBe("red");
	});

	it("returns defaultColor when both author and storedColor are empty", () => {
		expect(resolveColor("", undefined, "green")).toBe("green");
		expect(resolveColor("", "", "green")).toBe("green");
	});
});

describe("pickFreeLane", () => {
	it("returns null when all lanes are occupied", () => {
		expect(pickFreeLane(3, new Set([0, 1, 2]))).toBeNull();
	});

	it("returns the only free lane when others are occupied", () => {
		// random を 0 固定にして先頭候補を選ぶ
		expect(pickFreeLane(3, new Set([0, 2]), () => 0)).toBe(1);
	});

	it("returns 0 when no lane is occupied and random returns 0", () => {
		expect(pickFreeLane(3, new Set(), () => 0)).toBe(0);
	});

	it("uses random to pick among multiple free lanes", () => {
		// freeLanes = [0, 1, 2], random=0.99 → 末尾候補 (index 2) を選ぶ
		expect(pickFreeLane(3, new Set(), () => 0.99)).toBe(2);
	});
});

describe("computeLaneLayout", () => {
	it("returns laneHeight = fontSize * (1 + LANE_GAP_RATIO)", () => {
		const { laneHeightPx } = computeLaneLayout(10, 1000);
		expect(laneHeightPx).toBeCloseTo(12);
	});

	it("returns laneCount = floor(availableHeight / laneHeight), min 1", () => {
		expect(computeLaneLayout(10, 100).laneCount).toBe(8); // 100 / 12 = 8.33 → 8
		expect(computeLaneLayout(10, 5).laneCount).toBe(1); // 5 / 12 < 1 → 1 (clamp)
	});
});
