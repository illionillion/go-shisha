import type { ApiError } from "@/lib/api-client";
import type { ConflictError, ServerError, ValidationError } from "@/types/domain";
import { ConflictErrorCode, ServerErrorCode, ValidationErrorCode } from "@/types/domain";

/** 各エラーコードに対応する表示メッセージのマッピング */
const REGISTER_ERROR_MESSAGES: Record<string, string> = {
  [ConflictErrorCode.email_already_exists]: "このメールアドレスは既に使用されています",
  [ValidationErrorCode.validation_failed]: "入力値を確認してください",
  [ServerErrorCode.internal_server_error]: "サーバーエラーが発生しました",
};

/** APIエラーから表示用メッセージを返す */
export const getRegisterErrorMessage = (error: unknown): string => {
  const apiError = error as ApiError | undefined;
  const code = (apiError?.bodyJson as ConflictError | ValidationError | ServerError | undefined)
    ?.error;
  return REGISTER_ERROR_MESSAGES[code ?? ""] ?? "通信エラーが発生しました";
};
