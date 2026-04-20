import { STORAGE_KEYS } from "../../shared/storageKeys";

export const getColor = async (): Promise<string | undefined> => {
	const stored = await chrome.storage.local.get([STORAGE_KEYS.Color]);
	const value = stored[STORAGE_KEYS.Color];
	return typeof value === "string" ? value : undefined;
};

export const setColor = (value: string) =>
	chrome.storage.local.set({ [STORAGE_KEYS.Color]: value });

export const getFontSize = async (): Promise<string | undefined> => {
	const stored = await chrome.storage.local.get([STORAGE_KEYS.FontSize]);
	const value = stored[STORAGE_KEYS.FontSize];
	return typeof value === "string" ? value : undefined;
};

export const setFontSize = (value: string) =>
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
