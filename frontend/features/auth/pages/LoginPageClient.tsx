"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LoginForm } from "@/features/auth/components/LoginForm";
import type { LoginInput } from "@/types/auth";

export const LoginPageClient = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);

  const onSubmit = async (_data: LoginInput) => {
    setIsLoading(true);
    setErrorMessage(undefined);
    try {
      // mock
      await new Promise((r) => setTimeout(r, 200));
      router.push("/");
    } catch {
      setErrorMessage("通信エラーが発生しました");
    } finally {
      setIsLoading(false);
    }
  };

  return <LoginForm onSubmit={onSubmit} isLoading={isLoading} errorMessage={errorMessage} />;
};
