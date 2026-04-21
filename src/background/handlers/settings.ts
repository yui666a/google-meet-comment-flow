import type { Color, FontSize } from "../../shared/settings";
import { isColor, isFontSize } from "../../shared/settings";
import { STORAGE_KEYS } from "../../shared/storageKeys";

export const getColor = async (): Promise<Color | undefined> => {
	const stored = await chrome.storage.local.get([STORAGE_KEYS.Color]);
	const value = stored[STORAGE_KEYS.Color];
	return isColor(value) ? value : undefined;
};

export const setColor = (value: Color) =>
	chrome.storage.local.set({ [STORAGE_KEYS.Color]: value });

export const getFontSize = async (): Promise<FontSize | undefined> => {
	const stored = await chrome.storage.local.get([STORAGE_KEYS.FontSize]);
	const value = stored[STORAGE_KEYS.FontSize];
	return isFontSize(value) ? value : undefined;
};

export const setFontSize = (value: FontSize) =>
	chrome.storage.local.set({ [STORAGE_KEYS.FontSize]: value });

export const getIsEnabledStreaming = async (): Promise<boolean | undefined> => {
	const stored = await chrome.storage.local.get([
		STORAGE_KEYS.IsEnabledStreaming,
	]);
	const value = stored[STORAGE_KEYS.IsEnabledStreaming];
	return typeof value === "boolean" ? value : undefined;
};

export const setIsEnabledStreaming = (value: boolean) =>
	chrome.storage.local.set({ [STORAGE_KEYS.IsEnabledStreaming]: value });
