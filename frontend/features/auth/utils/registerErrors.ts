import type { ApiError } from "@/lib/api-client";
import type { ConflictError, ServerError, ValidationError } from "@/types/domain";
import { ConflictErrorCode, ServerErrorCode, ValidationErrorCode } from "@/types/domain";

/** Registerエンドポイントで返り得る全エラーコードのユニオン型 */
type RegisterErrorCode =
  | (typeof ConflictErrorCode)["email_already_exists"]
  | (typeof ValidationErrorCode)[keyof typeof ValidationErrorCode]
  | (typeof ServerErrorCode)[keyof typeof ServerErrorCode];

/** 各エラーコードに対応する表示メッセージのマッピング（追加漏れを型で検知） */
const REGISTER_ERROR_MESSAGES = {
  [ConflictErrorCode.email_already_exists]: "このメールアドレスは既に使用されています",
  [ValidationErrorCode.validation_failed]: "入力値を確認してください",
  [ServerErrorCode.internal_server_error]: "サーバーエラーが発生しました",
} satisfies Record<RegisterErrorCode, string>;

/** RegisterErrorCode かどうかを判定する型ガード */
const isRegisterErrorCode = (code: unknown): code is RegisterErrorCode => {
  return typeof code === "string" && Object.hasOwn(REGISTER_ERROR_MESSAGES, code);
};

/** APIエラーから表示用メッセージを返す */
export const getRegisterErrorMessage = (error: unknown): string => {
  const apiError = error as ApiError | undefined;
  const bodyJson = apiError?.bodyJson as ConflictError | ValidationError | ServerError | undefined;
  const code = bodyJson?.error;

  if (isRegisterErrorCode(code)) {
    return REGISTER_ERROR_MESSAGES[code];
  }

  return "通信エラーが発生しました";
};
