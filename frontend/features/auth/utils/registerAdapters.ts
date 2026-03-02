import type { RegisterInput } from "@/types/auth";
import type { CreateUserInput } from "@/types/domain";

/** フォーム入力をAPI入力型に変換する */
export const toCreateUserInput = (data: RegisterInput): CreateUserInput => ({
  email: data.email,
  password: data.password,
  display_name: data.displayName,
});
