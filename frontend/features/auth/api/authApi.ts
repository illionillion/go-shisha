import { postAuthLogin, postAuthLogout, postAuthRegister } from "@/api/auth";
import { isSuccessResponse } from "@/lib/api-helpers";
import type { AuthResponse, CreateUserInput, LoginInput } from "@/types/domain";

/**
 * 認証APIラッパー（薄いユースケース境界）
 * - orval生成関数に依存を閉じ込め、コンポーネント側では domain 型で扱う
 * - Orval 8.x のレスポンス構造 ({ data, status, headers }) から data を取り出して返す
 * - エラーハンドリングは呼び出し側で実施（ステータス別のメッセージ表示など）
 */
export const authApi = {
  login: async (data: LoginInput): Promise<AuthResponse> => {
    const response = await postAuthLogin(data);
    if (!isSuccessResponse(response)) {
      throw new Error("Login failed");
    }
    return response.data;
  },
  register: async (data: CreateUserInput): Promise<AuthResponse> => {
    const response = await postAuthRegister(data);
    if (!isSuccessResponse(response)) {
      throw new Error("Registration failed");
    }
    return response.data;
  },
  logout: async (): Promise<{ message?: string }> => {
    const response = await postAuthLogout();
    if (!isSuccessResponse(response)) {
      throw new Error("Logout failed");
    }
    return response.data;
  },
};
