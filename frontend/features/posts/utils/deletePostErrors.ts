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

/** DeletePostエンドポイントで返り得る全エラーコードのユニオン型 */
type DeletePostErrorCode =
  | (typeof ValidationErrorCode)[keyof typeof ValidationErrorCode]
  | (typeof UnauthorizedErrorCode)[keyof typeof UnauthorizedErrorCode]
  | (typeof ForbiddenErrorCode)[keyof typeof ForbiddenErrorCode]
  | (typeof NotFoundErrorCode)[keyof typeof NotFoundErrorCode]
  | (typeof ServerErrorCode)[keyof typeof ServerErrorCode];

/** 各エラーコードに対応する表示メッセージのマッピング（追加漏れを型で検知） */
const DELETE_POST_ERROR_MESSAGES = {
  [ValidationErrorCode.validation_failed]: "無効なリクエストです",
  [UnauthorizedErrorCode.unauthorized]: "ログインが必要です",
  [ForbiddenErrorCode.forbidden]: "この投稿を削除する権限がありません",
  [NotFoundErrorCode.not_found]: "投稿が見つかりません",
  [ServerErrorCode.internal_server_error]: "サーバーエラーが発生しました",
} satisfies Record<DeletePostErrorCode, string>;

/** DeletePostErrorCode かどうかを判定する型ガード */
const isDeletePostErrorCode = (code: unknown): code is DeletePostErrorCode => {
  return typeof code === "string" && Object.hasOwn(DELETE_POST_ERROR_MESSAGES, code);
};

/** APIエラーからDeletePost用の表示メッセージを返す */
export const getDeletePostErrorMessage = (error: unknown): string => {
  const apiError = error as ApiError | undefined;
  const bodyJson = apiError?.bodyJson as
    | ValidationError
    | UnauthorizedError
    | ForbiddenError
    | NotFoundError
    | ServerError
    | undefined;
  const code = bodyJson?.error;

  if (isDeletePostErrorCode(code)) {
    return DELETE_POST_ERROR_MESSAGES[code];
  }

  return "投稿の削除に失敗しました";
};
