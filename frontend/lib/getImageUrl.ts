export function getImageUrl(url?: string): string {
  if (!url) return "https://placehold.co/400x600/CCCCCC/666666?text=No+Image";
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!backendUrl) {
    return "https://placehold.co/400x600/CCCCCC/666666?text=No+Image";
  }
  // Normalize URL to have exactly one leading slash
  const normalizedUrl = `/${url.replace(/^\/+/, "")}`;
  // Normalize backend URL to have no trailing slashes
  const normalizedBackendUrl = backendUrl.replace(/\/+$/, "");
  return `${normalizedBackendUrl}${normalizedUrl}`;
}
