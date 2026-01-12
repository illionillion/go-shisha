export function getImageUrl(url?: string): string {
  if (!url) return "https://placehold.co/400x600/CCCCCC/666666?text=No+Image";
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!backendUrl) {
    return "https://placehold.co/400x600/CCCCCC/666666?text=No+Image";
  }
  // Ensure URL has leading slash
  const normalizedUrl = url.startsWith("/") ? url : `/${url}`;
  // Remove trailing slash from backend URL if present
  const normalizedBackendUrl = backendUrl.endsWith("/") ? backendUrl.slice(0, -1) : backendUrl;
  return `${normalizedBackendUrl}${normalizedUrl}`;
}
