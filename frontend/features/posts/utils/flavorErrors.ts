import type { ApiError } from "@/lib/api-client";
import type { ServerError } from "@/types/domain";
import { ServerErrorCode } from "@/types/domain";

/** GET /flavors エンドポイントで返り得る全エラーコードのユニオン型 */
type FlavorErrorCode = (typeof ServerErrorCode)[keyof typeof ServerErrorCode];

/** 各エラーコードに対応する表示メッセージのマッピング（追加漏れを型で検知） */
const FLAVOR_ERROR_MESSAGES = {
  [ServerErrorCode.internal_server_error]: "サーバーエラーが発生しました",
} satisfies Record<FlavorErrorCode, string>;

/** FlavorErrorCode かどうかを判定する型ガード */
const isFlavorErrorCode = (code: unknown): code is FlavorErrorCode => {
  return typeof code === "string" && Object.hasOwn(FLAVOR_ERROR_MESSAGES, code);
};

/** APIエラーからフレーバー一覧取得用の表示メッセージを返す */
export const getFlavorErrorMessage = (error: unknown): string => {
  const apiError = error as ApiError | undefined;
  const bodyJson = apiError?.bodyJson as ServerError | undefined;
  const code = bodyJson?.error;

  if (isFlavorErrorCode(code)) {
    return FLAVOR_ERROR_MESSAGES[code];
  }

  return "フレーバーの取得に失敗しました";
};
