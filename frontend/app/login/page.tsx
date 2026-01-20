import { Suspense } from "react";
import { AuthPageLayout } from "@/features/auth/components/AuthPageLayout";
import { LoginPageClient } from "@/features/auth/pages/LoginPageClient";

export default function LoginPage() {
  return (
    <AuthPageLayout>
      <Suspense fallback={<div>読み込み中...</div>}>
        <LoginPageClient />
      </Suspense>
    </AuthPageLayout>
  );
}
