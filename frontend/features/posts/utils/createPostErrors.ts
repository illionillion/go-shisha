import type { ApiError } from "@/lib/api-client";
import type {
  ForbiddenError,
  NotFoundError,
  ServerError,
  UnauthorizedError,
  ValidationError,
} from "@/types/domain";
import {
  ForbiddenErrorCode,
  NotFoundErrorCode,
  ServerErrorCode,
  UnauthorizedErrorCode,
  ValidationErrorCode,
} from "@/types/domain";

/** POST /posts エンドポイントで返り得る全エラーコードのユニオン型 */
type CreatePostErrorCode =
  | (typeof ValidationErrorCode)[keyof typeof ValidationErrorCode]
  | (typeof UnauthorizedErrorCode)[keyof typeof UnauthorizedErrorCode]
  | (typeof ForbiddenErrorCode)[keyof typeof ForbiddenErrorCode]
  | (typeof NotFoundErrorCode)[keyof typeof NotFoundErrorCode]
  | (typeof ServerErrorCode)[keyof typeof ServerErrorCode];

/** 各エラーコードに対応する表示メッセージのマッピング（追加漏れを型で検知） */
const CREATE_POST_ERROR_MESSAGES = {
  [ValidationErrorCode.validation_failed]: "入力内容を確認してください",
  [UnauthorizedErrorCode.unauthorized]: "ログインが必要です",
  [ForbiddenErrorCode.forbidden]: "この画像を使用する権限がありません",
  [NotFoundErrorCode.not_found]: "指定されたリソースが見つかりません",
  [ServerErrorCode.internal_server_error]: "サーバーエラーが発生しました",
} satisfies Record<CreatePostErrorCode, string>;

/** CreatePostErrorCode かどうかを判定する型ガード */
const isCreatePostErrorCode = (code: unknown): code is CreatePostErrorCode => {
  return typeof code === "string" && Object.hasOwn(CREATE_POST_ERROR_MESSAGES, code);
};

/**
 * APIエラーメッセージを日本語で返す
 *
 * @param error - API エラーオブジェクト（unknown型で受け取り内部で判定）
 * @returns 日本語エラーメッセージ
 */
export const getCreatePostErrorMessage = (error: unknown): string => {
  const apiError = error as ApiError | undefined;
  const bodyJson = apiError?.bodyJson as
    | ValidationError
    | UnauthorizedError
    | ForbiddenError
    | NotFoundError
    | ServerError
    | undefined;
  const code = bodyJson?.error;

  if (isCreatePostErrorCode(code)) {
    return CREATE_POST_ERROR_MESSAGES[code];
  }

  return "投稿の作成に失敗しました";
};
