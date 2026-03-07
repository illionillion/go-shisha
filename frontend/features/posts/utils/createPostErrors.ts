import type { ApiError } from "@/lib/api-client";
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
 * @param error - API エラーオブジェクト
 * @returns 日本語エラーメッセージ
 */
export const getCreatePostErrorMessage = (error: ApiError): string => {
  // ApiError.bodyJsonからエラーコードを取得して表示文言へ変換
  if (
    error.bodyJson &&
    typeof error.bodyJson === "object" &&
    "error" in error.bodyJson &&
    typeof error.bodyJson.error === "string"
  ) {
    const errorCode = error.bodyJson.error;
    if (isCreatePostErrorCode(errorCode)) {
      return CREATE_POST_ERROR_MESSAGES[errorCode];
    }

    return "投稿の作成に失敗しました";
  }
  return "投稿の作成に失敗しました";
};
