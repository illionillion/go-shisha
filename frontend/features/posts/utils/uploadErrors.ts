import type { ApiError } from "@/lib/api-client";
import type {
  PayloadTooLargeError,
  ServerError,
  UnauthorizedError,
  ValidationError,
} from "@/types/domain";
import {
  PayloadTooLargeErrorCode,
  ServerErrorCode,
  UnauthorizedErrorCode,
  ValidationErrorCode,
} from "@/types/domain";

/** POST /uploads/images エンドポイントで返り得る全エラーコードのユニオン型 */
type UploadErrorCode =
  | (typeof ValidationErrorCode)[keyof typeof ValidationErrorCode]
  | (typeof UnauthorizedErrorCode)[keyof typeof UnauthorizedErrorCode]
  | (typeof PayloadTooLargeErrorCode)[keyof typeof PayloadTooLargeErrorCode]
  | (typeof ServerErrorCode)[keyof typeof ServerErrorCode];

/** 各エラーコードに対応する表示メッセージのマッピング（追加漏れを型で検知） */
const UPLOAD_ERROR_MESSAGES = {
  [ValidationErrorCode.validation_failed]: "ファイル形式またはサイズが不正です",
  [UnauthorizedErrorCode.unauthorized]: "ログインが必要です",
  [PayloadTooLargeErrorCode.payload_too_large]: "ファイルサイズが大きすぎます",
  [ServerErrorCode.internal_server_error]: "サーバーエラーが発生しました",
} satisfies Record<UploadErrorCode, string>;

/** UploadErrorCode かどうかを判定する型ガード */
const isUploadErrorCode = (code: unknown): code is UploadErrorCode => {
  return typeof code === "string" && Object.hasOwn(UPLOAD_ERROR_MESSAGES, code);
};

/** APIエラーから画像アップロード用の表示メッセージを返す */
export const getUploadImageErrorMessage = (error: unknown): string => {
  const apiError = error as ApiError | undefined;
  const bodyJson = apiError?.bodyJson as
    | ValidationError
    | UnauthorizedError
    | PayloadTooLargeError
    | ServerError
    | undefined;
  const code = bodyJson?.error;

  if (isUploadErrorCode(code)) {
    return UPLOAD_ERROR_MESSAGES[code];
  }

  return "画像のアップロードに失敗しました";
};
