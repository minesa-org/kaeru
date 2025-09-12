/**
 * Check if the provided URL is a valid image URL
 * @param url
 * @returns
 */
export function isValidImageUrl(url) {
    if (!url)
        return false;
    try {
        new URL(url);
        return (/\.(jpg|jpeg|png|gif|webp|bmp|svg)(\?.*)?$/i.test(url) ||
            /discord|imgur|gyazo|prnt\.sc|i\.redd\.it|media\.tenor|giphy/i.test(url));
    }
    catch {
        return false;
    }
}
