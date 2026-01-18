"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { RegisterForm } from "@/features/auth/components/RegisterForm";
import type { RegisterInput } from "@/types/auth";

export const RegisterPageClient = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);

  const onSubmit = async (_data: RegisterInput) => {
    setIsLoading(true);
    setErrorMessage(undefined);
    try {
      // mock
      await new Promise((r) => setTimeout(r, 200));
      router.push("/");
    } catch (error) {
      console.error("RegisterPageClient onSubmit error:", error);
      setErrorMessage("通信エラーが発生しました");
    } finally {
      setIsLoading(false);
    }
  };

  return <RegisterForm onSubmit={onSubmit} isLoading={isLoading} errorMessage={errorMessage} />;
};
