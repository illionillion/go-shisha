import { AuthPageLayout } from "@/features/auth/components/AuthPageLayout";
import { LoginPageClient } from "@/features/auth/pages/LoginPageClient";

// useSearchParams()使用のため動的レンダリング必須
// 明示的に指定して意図を明確化
export const dynamic = "force-dynamic";

export default function LoginPage() {
  return (
    <AuthPageLayout>
      <LoginPageClient />
    </AuthPageLayout>
  );
}
