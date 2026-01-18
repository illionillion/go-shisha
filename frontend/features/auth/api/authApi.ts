import { postAuthLogin, postAuthRegister } from "@/api/auth";
import type { AuthResponse, CreateUserInput, LoginInput } from "@/types/domain";

/**
 * 認証APIラッパー（薄いユースケース境界）
 * - orval生成関数に依存を閉じ込め、コンポーネント側では domain 型で扱う
 * - エラーハンドリングは呼び出し側で実施（ステータス別のメッセージ表示など）
 */
export const authApi = {
  login: (data: LoginInput): Promise<AuthResponse> => postAuthLogin(data),
  register: (data: CreateUserInput): Promise<AuthResponse> => postAuthRegister(data),
};
