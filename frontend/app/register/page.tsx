import { Suspense } from "react";
import { AuthPageLayout } from "@/features/auth/components/AuthPageLayout";
import { RegisterPageClient } from "@/features/auth/pages/RegisterPageClient";

export default function RegisterPage() {
  return (
    <AuthPageLayout>
      <Suspense fallback={<div>読み込み中...</div>}>
        <RegisterPageClient />
      </Suspense>
    </AuthPageLayout>
  );
}
