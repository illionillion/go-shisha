"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { authApi } from "@/features/auth/api/authApi";
import { RegisterForm } from "@/features/auth/components/RegisterForm";
import { toCreateUserInput } from "@/features/auth/utils/registerAdapters";
import { getRegisterErrorMessage } from "@/features/auth/utils/registerErrors";
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
      const status = (error as ApiError)?.status;
      // 4xx はユーザー起因の想定内エラー（warn）、それ以外は予期しないエラー（error）
      if (status !== undefined && status >= 400 && status < 500) {
        console.warn("RegisterPageClient onSubmit error:", error);
      } else {
        console.error("RegisterPageClient onSubmit error:", error);
      }
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
