import { AuthPageLayout } from "@/features/auth/components/AuthPageLayout";
import { RegisterPageClient } from "@/features/auth/pages/RegisterPageClient";

export default function RegisterPage() {
  return (
    <AuthPageLayout>
      <RegisterPageClient />
    </AuthPageLayout>
  );
}
