import type { SettingsPayload } from "../../shared/messages";
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

// popup 初期化時に 3 設定を 1 message / 1 storage.get にまとめて取得する
export const getSettings = async (): Promise<SettingsPayload> => {
	const stored = await chrome.storage.local.get([
		STORAGE_KEYS.Color,
		STORAGE_KEYS.FontSize,
		STORAGE_KEYS.IsEnabledStreaming,
	]);

	const color = stored[STORAGE_KEYS.Color];
	const fontSize = stored[STORAGE_KEYS.FontSize];
	const isEnabledStreaming = stored[STORAGE_KEYS.IsEnabledStreaming];

	return {
		color: isColor(color) ? color : undefined,
		fontSize: isFontSize(fontSize) ? fontSize : undefined,
		isEnabledStreaming:
			typeof isEnabledStreaming === "boolean" ? isEnabledStreaming : undefined,
	};
};
