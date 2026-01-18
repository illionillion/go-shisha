import { z } from "zod";

/**
 * ログイン入力型
 * TODO: #91マージ後にOrval生成型へ差し替え
 */
export const loginInputSchema = z.object({
  email: z
    .string()
    .min(1, "メールアドレスを入力してください")
    .email("正しいメールアドレスを入力してください"),
  password: z
    .string()
    .min(1, "パスワードを入力してください")
    .min(12, "パスワードは12文字以上である必要があります")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "パスワードは大文字、小文字、数字を含む必要があります"
    ),
});

export type LoginInput = z.infer<typeof loginInputSchema>;

/**
 * 登録入力型
 * TODO: #91マージ後にOrval生成型へ差し替え
 */
export const registerInputSchema = z
  .object({
    email: z
      .string()
      .min(1, "メールアドレスを入力してください")
      .email("正しいメールアドレスを入力してください"),
    password: z
      .string()
      .min(1, "パスワードを入力してください")
      .min(12, "パスワードは12文字以上である必要があります")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "パスワードは大文字、小文字、数字を含む必要があります"
      ),
    confirmPassword: z.string().min(1, "パスワード（確認）を入力してください"),
    displayName: z
      .string()
      .min(1, "表示名を入力してください")
      .max(50, "表示名は50文字以内で入力してください"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "パスワードが一致しません",
    path: ["confirmPassword"],
  });

export type RegisterInput = z.infer<typeof registerInputSchema>;

/**
 * 認証レスポンス型
 * TODO: #91マージ後にOrval生成型へ差し替え
 */
export interface AuthResponse {
  token: string;
  user: User;
}

/**
 * ユーザー型
 * TODO: #91マージ後にOrval生成型へ差し替え
 */
export interface User {
  id: string;
  email: string;
  displayName: string;
  createdAt: string;
  updatedAt: string;
}
