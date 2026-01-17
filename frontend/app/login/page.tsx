import { AuthPageLayout } from "@/features/auth/components/AuthPageLayout";
import { LoginPageClient } from "@/features/auth/pages/LoginPageClient";

export default function LoginPage() {
  return (
    <AuthPageLayout>
      <LoginPageClient />
    </AuthPageLayout>
  );
}
