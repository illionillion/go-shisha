import type { ApiError } from "@/lib/api-client";
import type { ServerError, UnauthorizedError, ValidationError } from "@/types/domain";
import { ServerErrorCode, UnauthorizedErrorCode, ValidationErrorCode } from "@/types/domain";

/** Loginエンドポイントで返り得る全エラーコードのユニオン型 */
type LoginErrorCode =
  | (typeof ValidationErrorCode)[keyof typeof ValidationErrorCode]
  | (typeof UnauthorizedErrorCode)[keyof typeof UnauthorizedErrorCode]
  | (typeof ServerErrorCode)[keyof typeof ServerErrorCode];

/** 各エラーコードに対応する表示メッセージのマッピング（追加漏れを型で検知） */
const LOGIN_ERROR_MESSAGES = {
  [ValidationErrorCode.validation_failed]: "入力値を確認してください",
  [UnauthorizedErrorCode.unauthorized]: "メールアドレスまたはパスワードが正しくありません",
  [ServerErrorCode.internal_server_error]: "通信エラーが発生しました",
} satisfies Record<LoginErrorCode, string>;

/** LoginErrorCode かどうかを判定する型ガード */
const isLoginErrorCode = (code: unknown): code is LoginErrorCode => {
  return typeof code === "string" && Object.hasOwn(LOGIN_ERROR_MESSAGES, code);
};

/** APIエラーから表示用メッセージを返す */
export const getLoginErrorMessage = (error: unknown): string => {
  const apiError = error as ApiError | undefined;
  const bodyJson = apiError?.bodyJson as
    | ValidationError
    | UnauthorizedError
    | ServerError
    | undefined;
  const code = bodyJson?.error;

  if (isLoginErrorCode(code)) {
    return LOGIN_ERROR_MESSAGES[code];
  }

  return "通信エラーが発生しました";
};
