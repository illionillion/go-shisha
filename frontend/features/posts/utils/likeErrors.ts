import type { ApiError } from "@/lib/api-client";
import type {
  ConflictError,
  NotFoundError,
  ServerError,
  UnauthorizedError,
  ValidationError,
} from "@/types/domain";
import {
  ConflictErrorCode,
  NotFoundErrorCode,
  ServerErrorCode,
  UnauthorizedErrorCode,
  ValidationErrorCode,
} from "@/types/domain";

/** Likeエンドポイントで返り得る全エラーコードのユニオン型 */
type LikeErrorCode =
  | (typeof ConflictErrorCode)["already_liked"]
  | (typeof ValidationErrorCode)[keyof typeof ValidationErrorCode]
  | (typeof UnauthorizedErrorCode)[keyof typeof UnauthorizedErrorCode]
  | (typeof NotFoundErrorCode)[keyof typeof NotFoundErrorCode]
  | (typeof ServerErrorCode)[keyof typeof ServerErrorCode];

/** 各エラーコードに対応する表示メッセージのマッピング（追加漏れを型で検知） */
const LIKE_ERROR_MESSAGES = {
  [ConflictErrorCode.already_liked]: "この投稿にはすでにいいねしています",
  [ValidationErrorCode.validation_failed]: "無効なリクエストです",
  [UnauthorizedErrorCode.unauthorized]: "ログインが必要です",
  [NotFoundErrorCode.not_found]: "投稿が見つかりません",
  [ServerErrorCode.internal_server_error]: "サーバーエラーが発生しました",
} satisfies Record<LikeErrorCode, string>;

/** LikeErrorCode かどうかを判定する型ガード */
const isLikeErrorCode = (code: unknown): code is LikeErrorCode => {
  return typeof code === "string" && Object.hasOwn(LIKE_ERROR_MESSAGES, code);
};

/** Unlikeエンドポイントで返り得る全エラーコードのユニオン型 */
type UnlikeErrorCode =
  | (typeof ConflictErrorCode)["not_liked"]
  | (typeof ValidationErrorCode)[keyof typeof ValidationErrorCode]
  | (typeof UnauthorizedErrorCode)[keyof typeof UnauthorizedErrorCode]
  | (typeof NotFoundErrorCode)[keyof typeof NotFoundErrorCode]
  | (typeof ServerErrorCode)[keyof typeof ServerErrorCode];

/** 各エラーコードに対応する表示メッセージのマッピング（追加漏れを型で検知） */
const UNLIKE_ERROR_MESSAGES = {
  [ConflictErrorCode.not_liked]: "この投稿にはいいねしていません",
  [ValidationErrorCode.validation_failed]: "無効なリクエストです",
  [UnauthorizedErrorCode.unauthorized]: "ログインが必要です",
  [NotFoundErrorCode.not_found]: "投稿が見つかりません",
  [ServerErrorCode.internal_server_error]: "サーバーエラーが発生しました",
} satisfies Record<UnlikeErrorCode, string>;

/** UnlikeErrorCode かどうかを判定する型ガード */
const isUnlikeErrorCode = (code: unknown): code is UnlikeErrorCode => {
  return typeof code === "string" && Object.hasOwn(UNLIKE_ERROR_MESSAGES, code);
};

/** APIエラーからLike用の表示メッセージを返す */
export const getLikeErrorMessage = (error: unknown): string => {
  const apiError = error as ApiError | undefined;
  const bodyJson = apiError?.bodyJson as
    | ConflictError
    | ValidationError
    | UnauthorizedError
    | NotFoundError
    | ServerError
    | undefined;
  const code = bodyJson?.error;

  if (isLikeErrorCode(code)) {
    return LIKE_ERROR_MESSAGES[code];
  }

  return "いいねに失敗しました";
};

/** APIエラーからUnlike用の表示メッセージを返す */
export const getUnlikeErrorMessage = (error: unknown): string => {
  const apiError = error as ApiError | undefined;
  const bodyJson = apiError?.bodyJson as
    | ConflictError
    | ValidationError
    | UnauthorizedError
    | NotFoundError
    | ServerError
    | undefined;
  const code = bodyJson?.error;

  if (isUnlikeErrorCode(code)) {
    return UNLIKE_ERROR_MESSAGES[code];
  }

  return "いいね解除に失敗しました";
};
