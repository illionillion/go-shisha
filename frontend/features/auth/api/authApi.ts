import { postAuthLogin, postAuthLogout, postAuthRegister } from "@/api/auth";
import { isSuccessResponse } from "@/lib/api-helpers";
import type { AuthResponse, CreateUserInput, LoginInput } from "@/types/domain";

/**
 * 認証APIラッパー（薄いユースケース境界）
 * - orval生成関数に依存を閉じ込め、コンポーネント側では domain 型で扱う
 * - Orval 8.x のレスポンス構造 ({ data, status, headers }) から data を取り出して返す
 * - apiFetchがエラー時にthrowするため、responseは常に成功レスポンスだが、
 *   TypeScriptの型推論のためにisSuccessResponseで明示的に絞り込む
 * - エラーハンドリングは呼び出し側で実施（try-catchでキャッチ）
 */
export const authApi = {
  login: async (data: LoginInput): Promise<AuthResponse> => {
    const response = await postAuthLogin(data);
    // apiFetchがエラー時にthrowするため、ここは常に成功レスポンス
    // TypeScriptの型推論のために型ガードで絞り込む
    if (isSuccessResponse(response)) {
      return response.data;
    }
    // 到達不能（apiFetchが既にthrowしている）が、型安全性のためにエラー分岐を記述
    throw new Error(response.data.error || "Login failed");
  },
  register: async (data: CreateUserInput): Promise<AuthResponse> => {
    const response = await postAuthRegister(data);
    if (isSuccessResponse(response)) {
      return response.data;
    }
    throw new Error(response.data.error || "Registration failed");
  },
  logout: async (): Promise<{ message?: string }> => {
    const response = await postAuthLogout();
    if (isSuccessResponse(response)) {
      return response.data;
    }
    throw new Error(response.data.error || "Logout failed");
  },
};
