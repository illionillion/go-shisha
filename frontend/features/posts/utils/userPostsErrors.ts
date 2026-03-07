import type { ApiError } from "@/lib/api-client";
import type { NotFoundError, ServerError, ValidationError } from "@/types/domain";
import { NotFoundErrorCode, ServerErrorCode, ValidationErrorCode } from "@/types/domain";

/** GET /users/:id/posts エンドポイントで返り得る全エラーコードのユニオン型 */
type UserPostsErrorCode =
  | (typeof ValidationErrorCode)[keyof typeof ValidationErrorCode]
  | (typeof NotFoundErrorCode)[keyof typeof NotFoundErrorCode]
  | (typeof ServerErrorCode)[keyof typeof ServerErrorCode];

/** 各エラーコードに対応する表示メッセージのマッピング（追加漏れを型で検知） */
const USER_POSTS_ERROR_MESSAGES = {
  [ValidationErrorCode.validation_failed]: "無効なユーザーIDです",
  [NotFoundErrorCode.not_found]: "ユーザーが見つかりません",
  [ServerErrorCode.internal_server_error]: "サーバーエラーが発生しました",
} satisfies Record<UserPostsErrorCode, string>;

/** UserPostsErrorCode かどうかを判定する型ガード */
const isUserPostsErrorCode = (code: unknown): code is UserPostsErrorCode => {
  return typeof code === "string" && Object.hasOwn(USER_POSTS_ERROR_MESSAGES, code);
};

/** APIエラーからユーザー投稿一覧取得用の表示メッセージを返す */
export const getUserPostsErrorMessage = (error: unknown): string => {
  const apiError = error as ApiError | undefined;
  const bodyJson = apiError?.bodyJson as ValidationError | NotFoundError | ServerError | undefined;
  const code = bodyJson?.error;

  if (isUserPostsErrorCode(code)) {
    return USER_POSTS_ERROR_MESSAGES[code];
  }

  return "投稿の取得に失敗しました";
};
