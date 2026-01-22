import { AuthPageLayout } from "@/features/auth/components/AuthPageLayout";
import { RegisterPageClient } from "@/features/auth/pages/RegisterPageClient";

// useSearchParams()使用のため動的レンダリング必須
// 明示的に指定して意図を明確化
export const dynamic = "force-dynamic";

export default function RegisterPage() {
  return (
    <AuthPageLayout>
      <RegisterPageClient />
    </AuthPageLayout>
  );
}
