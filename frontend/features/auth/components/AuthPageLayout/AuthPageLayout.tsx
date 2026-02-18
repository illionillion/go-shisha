import { clsx } from "clsx";
import type { ReactNode } from "react";
import { BrandSection } from "../BrandSection";

/**
 * AuthPageLayoutコンポーネントのProps
 */
export interface AuthPageLayoutProps {
  /** フォームエリアのコンテンツ（LoginForm or RegisterForm） */
  children: ReactNode;
}

/**
 * 認証画面専用レイアウトコンポーネント
 *
 * @description
 * ログイン/登録画面で使用する2カラムレイアウト。
 * - PC: 左側60%（BrandSection固定）、右側40%（フォーム）
 * - モバイル: 1カラム（フォームのみ表示）
 *
 * @example
 * ```tsx
 * <AuthPageLayout>
 *   <LoginForm />
 * </AuthPageLayout>
 * ```
 */
export const AuthPageLayout = ({ children }: AuthPageLayoutProps) => {
  return (
    <div className={clsx(["flex", "min-h-screen", "flex-col", "md:flex-row"])}>
      {/* 左側: ブランドエリア（PC: 60%, モバイル: 非表示） */}
      <div className={clsx(["hidden", "md:flex", "md:w-3/5"])}>
        <BrandSection />
      </div>

      {/* 右側: フォームエリア（PC: 40%, モバイル: 100%） */}
      <div className={clsx(["flex", "w-full", "items-center", "justify-center", "bg-gray-50", "p-6", "md:w-2/5", "md:p-8"])}>
        <div className={clsx(["w-full", "max-w-md"])}>{children}</div>
      </div>
    </div>
  );
};
