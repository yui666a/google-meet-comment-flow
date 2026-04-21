import { describe, expect, it } from "vitest";
import { decodeHtmlEntities } from "./decodeHtmlEntities";

describe("decodeHtmlEntities", () => {
	it("decodes the six supported named/numeric entities", () => {
		expect(decodeHtmlEntities("&amp;")).toBe("&");
		expect(decodeHtmlEntities("&lt;")).toBe("<");
		expect(decodeHtmlEntities("&gt;")).toBe(">");
		expect(decodeHtmlEntities("&quot;")).toBe('"');
		expect(decodeHtmlEntities("&#x27;")).toBe("'");
		expect(decodeHtmlEntities("&#x60;")).toBe("`");
	});

	it("decodes multiple entities in a single string", () => {
		expect(decodeHtmlEntities("a &amp; b &lt; c &gt; d")).toBe("a & b < c > d");
	});

	it("returns the input untouched when there are no entities", () => {
		expect(decodeHtmlEntities("plain text")).toBe("plain text");
	});

	it("does not decode entities that are not in the allow-list", () => {
		// 意図的にホワイトリスト置換のため、未対応エンティティはそのまま残る
		expect(decodeHtmlEntities("&hellip;")).toBe("&hellip;");
		expect(decodeHtmlEntities("&nbsp;")).toBe("&nbsp;");
	});
});
