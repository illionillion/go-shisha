"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { authApi } from "@/features/auth/api/authApi";
import { RegisterForm } from "@/features/auth/components/RegisterForm";
import type { ApiError } from "@/lib/api-client";
import type { RegisterInput } from "@/types/auth";
import type { CreateUserInput } from "@/types/domain";

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

const getRegisterErrorMessage = (error: unknown) => {
  const apiError = error as ApiError | undefined;
  switch (apiError?.status) {
    case 409:
      return "このメールアドレスは既に使用されています";
    case 400:
      return "入力値を確認してください";
    default:
      return "通信エラーが発生しました";
  }
};
