import fs from "node:fs";
import path from "node:path";
import { log } from "./colors.js";

/**
 * Returns a base64 data URI string for a local image file.
 * Example output: "data:image/png;base64,iVBORw0KGgo..."
 *
 * @param relativePath Path relative to the project root or current file
 * @returns Base64-encoded data URI of the image
 */
export function getImageBase64(relativePath: string): string {
	try {
		const absolutePath = path.isAbsolute(relativePath)
			? relativePath
			: path.join(process.cwd(), relativePath);

		if (!fs.existsSync(absolutePath)) {
			throw new Error(`File not found: ${absolutePath}`);
		}

		const imageBuffer = fs.readFileSync(absolutePath);
		const ext = path.extname(absolutePath).toLowerCase().replace(".", "");
		const mimeType = ext === "jpg" ? "jpeg" : ext; // normalize jpg → jpeg

		return `data:image/${mimeType};base64,${imageBuffer.toString("base64")}`;
	} catch (err) {
		log("error", "[getImageBase64] Failed to load image:", err);
		throw err;
	}
}
