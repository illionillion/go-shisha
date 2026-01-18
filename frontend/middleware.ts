import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_PATHS = ["/login", "/register", "/test"];

/**
 * 認証必須ページのガード
 * - access_token クッキーが無ければ /login へリダイレクト
 * - login/register/test などのパブリックページは除外
 */
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  const hasAccessToken = req.cookies.get("access_token")?.value;
  if (!hasAccessToken) {
    const loginUrl = new URL("/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

function isPublicPath(pathname: string) {
  if (PUBLIC_PATHS.includes(pathname)) return true;
  // Next.js内部・静的ファイル系はスキップ
  if (pathname.startsWith("/_next")) return true;
  if (pathname.startsWith("/api")) return true;
  if (/\.[^/]+$/.test(pathname)) return true; // 静的アセット
  return false;
}

// すべてのルートを対象としつつ、_nextや静的ファイルは除外
export const config = {
  matcher: "/:path*",
};
