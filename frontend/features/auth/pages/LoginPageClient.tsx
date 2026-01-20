"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { authApi } from "@/features/auth/api/authApi";
import { LoginForm } from "@/features/auth/components/LoginForm";
import { useAuthStore } from "@/features/auth/stores/authStore";
import type { ApiError } from "@/lib/api-client";
import type { LoginInput } from "@/types/auth";

export const LoginPageClient = () => {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);
  const { setUser } = useAuthStore();

  const { mutateAsync: login, isPending } = useMutation({
    mutationFn: (data: LoginInput) => authApi.login(data),
  });

  const onSubmit = async (data: LoginInput) => {
    setErrorMessage(undefined);
    try {
      const res = await login(data);
      setUser(res.user ?? null);
      router.push("/");
    } catch (error) {
      console.error("LoginPageClient: login request failed", error);
      setErrorMessage(getLoginErrorMessage(error));
    }
  };

  return <LoginForm onSubmit={onSubmit} isLoading={isPending} errorMessage={errorMessage} />;
};

const getLoginErrorMessage = (error: unknown) => {
  const apiError = error as ApiError | undefined;
  switch (apiError?.status) {
    case 401:
      return "メールアドレスまたはパスワードが正しくありません";
    case 400:
      return "入力値を確認してください";
    default:
      return "通信エラーが発生しました";
  }
};
