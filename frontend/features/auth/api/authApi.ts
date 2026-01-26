import { postAuthLogin, postAuthLogout, postAuthRegister } from "@/api/auth";
import type { AuthResponse, CreateUserInput, LoginInput, LogoutResponse } from "@/types/domain";

/**
 * 認証APIラッパー（薄いユースケース境界）
 * - orval生成関数に依存を閉じ込め、コンポーネント側では domain 型で扱う
 * - Orval 8.x のレスポンス構造 ({ data, status, headers }) から data を取り出して返す
 * - apiFetchがエラー時にthrowするため、responseは常に成功レスポンス
 * - 型推論の詳細は @/lib/api-helpers のドキュメントを参照
 */
export const authApi = {
  login: async (data: LoginInput): Promise<AuthResponse> => {
    const response = await postAuthLogin(data);
    // apiFetchがエラー時にthrowするため、ここは常に成功レスポンス（status: 200）
    // 型定義はユニオン型だが、実行時は必ず postAuthLoginResponse200
    type SuccessResponse = Extract<typeof response, { status: 200 }>;
    return (response as SuccessResponse).data;
  },
  register: async (data: CreateUserInput): Promise<AuthResponse> => {
    const response = await postAuthRegister(data);
    // 成功レスポンス（status: 201 Created）
    type SuccessResponse = Extract<typeof response, { status: 201 }>;
    return (response as SuccessResponse).data;
  },
  logout: async (): Promise<LogoutResponse> => {
    const response = await postAuthLogout();
    // 成功レスポンス（status: 200）
    type SuccessResponse = Extract<typeof response, { status: 200 }>;
    return (response as SuccessResponse).data;
  },
};
