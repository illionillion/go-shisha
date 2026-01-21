import { NextResponse, type NextRequest } from "next/server";
import { encryptRedirect } from "./lib/redirectCrypto";
import { isSafeRedirectPath } from "./lib/validateRedirect";

const PUBLIC_PATHS = ["/login", "/register", "/test"];
const AUTH_PAGES = ["/login", "/register"];

/**
 * 認証必須ページのガード
 * - access_token クッキーが無ければ /login へリダイレクト
 * - ログイン済みユーザーが認証ページにアクセスした場合は / へリダイレクト
 * - login/register/test などのパブリックページは除外
 *
 * 【認証検証について】
 * このミドルウェアはCookieの存在のみをチェックし、トークンの有効性（期限切れ・改ざん）は検証しません。
 * これは意図的な設計で、以下の理由によります：
 * - ミドルウェアは軽量なルーティングガードとして機能（UX向上のための事前チェック）
 * - 実際の認証検証はバックエンドAPIエンドポイントで行われる（セキュリティの責務分離）
 * - クライアント側ではAuthHydratorが/auth/meを呼び出し、トークンの有効性を確認してストアを同期
 * - 期限切れトークンの場合、APIが401を返し、AuthHydratorがログアウト処理を実行
 */
export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const hasAccessToken = req.cookies.get("access_token")?.value;

  // ログイン済みユーザーが認証ページ（/login, /register）にアクセスした場合
  if (hasAccessToken && AUTH_PAGES.includes(pathname)) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  if (!hasAccessToken) {
    const original = `${pathname}${search || ""}`;
    const loginUrl = new URL("/login", req.url);
    if (isSafeRedirectPath(original)) {
      try {
        const token = await encryptRedirect(original);
        loginUrl.searchParams.set("redirectUrl", token);
      } catch (error) {
        if (process.env.NODE_ENV === "development") {
          console.error("Failed to encrypt redirect URL:", error);
        }
        // ignore and fallback to plain /login
      }
    }
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
  // 注: req.nextUrl.pathnameにはクエリパラメータは含まれず、Next.jsがパスを正規化するため
  // パストラバーサル（/api/../login.png）やクエリ攻撃（/file.jpg?token=secret）の心配はない
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
