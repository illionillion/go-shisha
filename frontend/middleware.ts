import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_PATHS = ["/login", "/register", "/test"];
const AUTH_PAGES = ["/login", "/register"];

/**
 * 認証必須ページのガード
 * - access_token クッキーが無ければ /login へリダイレクト
 * - ログイン済みユーザーが認証ページにアクセスした場合は / へリダイレクト
 * - login/register/test などのパブリックページは除外
 */
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const hasAccessToken = req.cookies.get("access_token")?.value;

  // ログイン済みユーザーが認証ページ（/login, /register）にアクセスした場合
  if (hasAccessToken && AUTH_PAGES.includes(pathname)) {
    const homeUrl = new URL("/", req.url);
    return NextResponse.redirect(homeUrl);
  }

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

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
  // 静的アセット（画像、フォント、CSS/JS等）
  if (
    /\.(jpg|jpeg|png|gif|svg|webp|ico|bmp|woff|woff2|ttf|otf|eot|css|js|xml|txt|pdf|zip)$/i.test(
      pathname
    )
  ) {
    return true;
  }
  return false;
}

// すべてのルートを対象としつつ、_nextや静的ファイルは除外
export const config = {
  matcher: "/:path*",
};
