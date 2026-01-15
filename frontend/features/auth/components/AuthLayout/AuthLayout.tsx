import type { ReactNode } from "react";

/**
 * AuthLayoutコンポーネントのProps
 */
export interface AuthLayoutProps {
  /** 左側のブランドエリアコンテンツ */
  brandContent: ReactNode;
  /** 右側のフォームエリアコンテンツ */
  formContent: ReactNode;
}

/**
 * 認証画面用の2カラムレイアウトコンポーネント
 *
 * @description
 * X（旧Twitter）やLinkedInのような分割レイアウトを実装します。
 * - PC: 左側60%（ブランド）、右側40%（フォーム）の2カラム
 * - モバイル: 1カラム（フォームを優先表示）
 *
 * @example
 * ```tsx
 * <AuthLayout
 *   brandContent={<BrandSection />}
 *   formContent={<LoginForm />}
 * />
 * ```
 */
export const AuthLayout = ({ brandContent, formContent }: AuthLayoutProps) => {
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* 左側: ブランドエリア（PC: 60%, モバイル: 非表示） */}
      <div className="hidden md:flex md:w-3/5">{brandContent}</div>

      {/* 右側: フォームエリア（PC: 40%, モバイル: 100%） */}
      <div className="flex w-full items-center justify-center bg-gray-50 p-6 md:w-2/5 md:p-8">
        <div className="w-full max-w-md">{formContent}</div>
      </div>
    </div>
  );
};
