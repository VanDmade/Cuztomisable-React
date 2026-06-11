export function resolveImageUrl(imagePath: string | null | undefined, baseUrl: string): string | null {
    if (!imagePath) return null;
    const origin = baseUrl.replace(/\/api\/?$/, '');
    // unwrap double-URL artifact: http://host/storage/http://host/... → http://host/...
    const path = imagePath.match(/\/storage\/(https?:\/\/.+)/)?.[1] ?? imagePath;
    if (/^https?:\/\//.test(path)) {
        return path.replace(/^https?:\/\/localhost(:\d+)?/, origin);
    }
    return `${origin}/storage/${path.replace(/^\//, '')}`;
}
