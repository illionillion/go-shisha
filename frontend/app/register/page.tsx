import { AuthPageLayout } from "@/features/auth/components/AuthPageLayout";
import { RegisterPageClient } from "@/features/auth/pages/RegisterPageClient";

export const dynamic = "force-dynamic";

export default function RegisterPage() {
  return (
    <AuthPageLayout>
      <RegisterPageClient />
    </AuthPageLayout>
  );
}
