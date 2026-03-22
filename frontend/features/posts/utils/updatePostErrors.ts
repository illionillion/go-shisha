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

/** UpdatePostエンドポイントで返り得る全エラーコードのユニオン型 */
type UpdatePostErrorCode =
  | (typeof ValidationErrorCode)[keyof typeof ValidationErrorCode]
  | (typeof UnauthorizedErrorCode)[keyof typeof UnauthorizedErrorCode]
  | (typeof ForbiddenErrorCode)[keyof typeof ForbiddenErrorCode]
  | (typeof NotFoundErrorCode)[keyof typeof NotFoundErrorCode]
  | (typeof ServerErrorCode)[keyof typeof ServerErrorCode];

/** 各エラーコードに対応する表示メッセージのマッピング（追加漏れを型で検知） */
const UPDATE_POST_ERROR_MESSAGES = {
  [ValidationErrorCode.validation_failed]: "無効なリクエストです",
  [UnauthorizedErrorCode.unauthorized]: "ログインが必要です",
  [ForbiddenErrorCode.forbidden]: "この投稿を編集する権限がありません",
  [NotFoundErrorCode.not_found]: "投稿が見つかりません",
  [ServerErrorCode.internal_server_error]: "サーバーエラーが発生しました",
} satisfies Record<UpdatePostErrorCode, string>;

/** UpdatePostErrorCode かどうかを判定する型ガード */
const isUpdatePostErrorCode = (code: unknown): code is UpdatePostErrorCode => {
  return typeof code === "string" && Object.hasOwn(UPDATE_POST_ERROR_MESSAGES, code);
};

/** APIエラーからUpdatePost用の表示メッセージを返す */
export const getUpdatePostErrorMessage = (error: unknown): string => {
  const apiError = error as ApiError | undefined;
  const bodyJson = apiError?.bodyJson as
    | ValidationError
    | UnauthorizedError
    | ForbiddenError
    | NotFoundError
    | ServerError
    | undefined;
  const code = bodyJson?.error;

  if (isUpdatePostErrorCode(code)) {
    return UPDATE_POST_ERROR_MESSAGES[code];
  }

  return "投稿の編集に失敗しました";
};
