"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { authApi } from "@/features/auth/api/authApi";
import { RegisterForm } from "@/features/auth/components/RegisterForm";
import type { ApiError } from "@/lib/api-client";
import type { RegisterInput } from "@/types/auth";
import type { ConflictError, CreateUserInput, ServerError, ValidationError } from "@/types/domain";
import { ConflictErrorCode, ServerErrorCode, ValidationErrorCode } from "@/types/domain";

export const RegisterPageClient = () => {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);
  const searchParams = useSearchParams();
  const redirectToken = searchParams?.get("redirectUrl");
  const loginHref = redirectToken
    ? `/login?redirectUrl=${encodeURIComponent(redirectToken)}`
    : "/login";

  const { mutateAsync: register, isPending } = useMutation({
    mutationFn: (data: CreateUserInput) => authApi.register(data),
  });

  const onSubmit = async (data: RegisterInput) => {
    setErrorMessage(undefined);
    try {
      const payload = toCreateUserInput(data);
      await register(payload);
      router.push(loginHref);
    } catch (error) {
      console.error("RegisterPageClient onSubmit error:", error);
      setErrorMessage(getRegisterErrorMessage(error));
    }
  };

  return (
    <RegisterForm
      onSubmit={onSubmit}
      isLoading={isPending}
      errorMessage={errorMessage}
      loginHref={loginHref}
    />
  );
};

const toCreateUserInput = (data: RegisterInput): CreateUserInput => ({
  email: data.email,
  password: data.password,
  display_name: data.displayName,
});

/** 各エラーコードに対応する表示メッセージのマッピング */
const REGISTER_ERROR_MESSAGES: Record<string, string> = {
  [ConflictErrorCode.email_already_exists]: "このメールアドレスは既に使用されています",
  [ValidationErrorCode.validation_failed]: "入力値を確認してください",
  [ServerErrorCode.internal_server_error]: "サーバーエラーが発生しました",
};

/** APIエラーから表示用メッセージを返す */
const getRegisterErrorMessage = (error: unknown): string => {
  const apiError = error as ApiError | undefined;
  const code = (apiError?.bodyJson as ConflictError | ValidationError | ServerError | undefined)
    ?.error;
  return REGISTER_ERROR_MESSAGES[code ?? ""] ?? "通信エラーが発生しました";
};
