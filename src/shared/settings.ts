export const COLORS = {
	Auto: "auto",
	Black: "black",
	Red: "red",
	Orange: "orange",
	Yellow: "yellow",
	Green: "green",
	Blue: "blue",
	Indigo: "indigo",
	Purple: "purple",
} as const;

export type Color = (typeof COLORS)[keyof typeof COLORS];

export const FONT_SIZES = {
	Xs: "XS",
	S: "S",
	M: "M",
	L: "L",
	Xl: "XL",
} as const;

export type FontSize = (typeof FONT_SIZES)[keyof typeof FONT_SIZES];

export const DEFAULT_FONT_SIZE: FontSize = "L";

export const FONT_SIZE_COEFFICIENTS: Record<FontSize, number> = {
	XS: 0.25,
	S: 0.5,
	M: 1,
	L: 2,
	XL: 4,
};

export const isColor = (value: unknown): value is Color =>
	typeof value === "string" &&
	Object.values(COLORS).some((color) => color === value);

export const isFontSize = (value: unknown): value is FontSize =>
	typeof value === "string" &&
	Object.values(FONT_SIZES).some((fontSize) => fontSize === value);
