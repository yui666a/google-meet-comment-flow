import "./App.css";
import { type ChangeEvent, useEffect, useState } from "react";
import {
	COLORS,
	type Color,
	DEFAULT_FONT_SIZE,
	FONT_SIZES,
	type FontSize,
	isColor,
	isFontSize,
} from "../shared/settings";

const App = () => {
	const [color, setColor] = useState<Color>(COLORS.Auto);
	const [fontSize, setFontSize] = useState<FontSize>(DEFAULT_FONT_SIZE);
	const [isEnabledStreaming, setIsEnabledStreaming] = useState<boolean>(false);

	const handleChangeColor = (e: ChangeEvent<HTMLSelectElement>) => {
		const value = e.target.value;
		if (!isColor(value)) return;

		setColor(value);
		chrome.runtime.sendMessage({ method: "setColor", value });
	};

	const handleChangeFontSize = (e: ChangeEvent<HTMLSelectElement>) => {
		const value = e.target.value;
		if (!isFontSize(value)) return;

		setFontSize(value);
		chrome.runtime.sendMessage({ method: "setFontSize", value });
	};

	const handleChangeIsEnabledStreaming = () => {
		const value = !isEnabledStreaming;

		setIsEnabledStreaming(value);
		chrome.runtime.sendMessage({ method: "setIsEnabledStreaming", value });
	};

	useEffect(() => {
		const loadStoredSettings = async () => {
			try {
				const [storedColor, storedFontSize, storedIsEnabledStreaming] =
					await Promise.all([
						chrome.runtime.sendMessage({ method: "getColor" }),
						chrome.runtime.sendMessage({ method: "getFontSize" }),
						chrome.runtime.sendMessage({ method: "getIsEnabledStreaming" }),
					]);

				if (isColor(storedColor)) setColor(storedColor);
				if (isFontSize(storedFontSize)) setFontSize(storedFontSize);
				if (typeof storedIsEnabledStreaming === "boolean") {
					setIsEnabledStreaming(storedIsEnabledStreaming);
				}
			} catch (e) {
				console.error(e);
			}
		};

		loadStoredSettings();
	}, []);

	return (
		<div className="container">
			<header>Comment Stream for Meet</header>
			<main>
				<div className="form-group">
					<label htmlFor="comment-color">Color</label>
					<select
						name="comment-color"
						id="comment-color"
						value={color}
						onChange={handleChangeColor}
					>
						{Object.values(COLORS).map((c) => (
							<option key={c} value={c}>
								{c}
							</option>
						))}
					</select>
				</div>
				<div className="form-group">
					<label htmlFor="comment-font-size">Font Size</label>
					<select
						name="comment-font-size"
						id="comment-font-size"
						value={fontSize}
						onChange={handleChangeFontSize}
					>
						{Object.values(FONT_SIZES).map((fs) => (
							<option key={fs} value={fs}>
								{fs}
							</option>
						))}
					</select>
				</div>
				<div className="form-group">
					<label htmlFor="comment-enable-streaming">Enable Streaming</label>
					<div id="comment-enable-streaming" className="toggle-btn">
						<input
							id="toggle"
							className="toggle-input"
							type="checkbox"
							checked={isEnabledStreaming}
							onChange={handleChangeIsEnabledStreaming}
						/>
						{/* biome-ignore lint/a11y/noLabelWithoutControl: CSS toggle label paired with input via htmlFor */}
						<label htmlFor="toggle" className="toggle-label" />
					</div>
				</div>
			</main>
		</div>
	);
};

export default App;
