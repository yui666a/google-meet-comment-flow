import { describe, expect, it } from "vitest";
import { COLORS, FONT_SIZES, isColor, isFontSize } from "./settings";

describe("isColor", () => {
	it("returns true for every value in COLORS", () => {
		for (const value of Object.values(COLORS)) {
			expect(isColor(value)).toBe(true);
		}
	});

	it("returns false for unknown string", () => {
		expect(isColor("pink")).toBe(false);
	});

	it("returns false for non-string values", () => {
		expect(isColor(undefined)).toBe(false);
		expect(isColor(null)).toBe(false);
		expect(isColor(123)).toBe(false);
		expect(isColor({})).toBe(false);
	});
});

describe("isFontSize", () => {
	it("returns true for every value in FONT_SIZES", () => {
		for (const value of Object.values(FONT_SIZES)) {
			expect(isFontSize(value)).toBe(true);
		}
	});

	it("returns false for lowercase variants", () => {
		expect(isFontSize("m")).toBe(false);
		expect(isFontSize("xl")).toBe(false);
	});

	it("returns false for non-string values", () => {
		expect(isFontSize(undefined)).toBe(false);
		expect(isFontSize(null)).toBe(false);
		expect(isFontSize(1)).toBe(false);
	});
});
