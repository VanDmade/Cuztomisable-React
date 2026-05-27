export function resolveImageUrl(imagePath: string | null | undefined, baseUrl: string): string | null {
    if (!imagePath) return null;
    if (/^https?:\/\//.test(imagePath)) {
        const apiOrigin = baseUrl.replace(/\/api\/?$/, '');
        return imagePath.replace(/^https?:\/\/localhost(:\d+)?/, apiOrigin);
    }
    return imagePath;
}
