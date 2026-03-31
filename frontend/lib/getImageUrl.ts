export function getImageUrl(url?: string): string {
  if (!url) return "https://placehold.co/400x600/CCCCCC/666666?text=No+Image";
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  // 相対パスはそのまま返す。/images/:path* は next.config.ts の rewrites で BACKEND_URL に転送される
  return `/${url.replace(/^\/+/, "")}`;
}
