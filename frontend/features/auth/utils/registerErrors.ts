import type { ApiError } from "@/lib/api-client";
import type { ConflictError, ServerError, ValidationError } from "@/types/domain";
import { ConflictErrorCode, ServerErrorCode, ValidationErrorCode } from "@/types/domain";

/** Registerエンドポイントで返り得る全エラーコードのユニオン型 */
type RegisterErrorCode =
  | (typeof ConflictErrorCode)[keyof typeof ConflictErrorCode]
  | (typeof ValidationErrorCode)[keyof typeof ValidationErrorCode]
  | (typeof ServerErrorCode)[keyof typeof ServerErrorCode];

/** 各エラーコードに対応する表示メッセージのマッピング（追加漏れを型で検知） */
const REGISTER_ERROR_MESSAGES = {
  [ConflictErrorCode.email_already_exists]: "このメールアドレスは既に使用されています",
  [ValidationErrorCode.validation_failed]: "入力値を確認してください",
  [ServerErrorCode.internal_server_error]: "サーバーエラーが発生しました",
} satisfies Record<RegisterErrorCode, string>;

/** APIエラーから表示用メッセージを返す */
export const getRegisterErrorMessage = (error: unknown): string => {
  const apiError = error as ApiError | undefined;
  const code = (apiError?.bodyJson as ConflictError | ValidationError | ServerError | undefined)
    ?.error;
  return REGISTER_ERROR_MESSAGES[code as RegisterErrorCode] ?? "通信エラーが発生しました";
};
