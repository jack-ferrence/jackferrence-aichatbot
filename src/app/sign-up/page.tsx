import Link from "next/link";
import { AuthCard } from "@/components/auth-card";
import { SignUpForm } from "@/components/sign-up-form";

export const metadata = { title: "Create account — TakeHome" };

export default function SignUpPage() {
  return (
    <AuthCard
      title="Create your account"
      subtitle="Secure workspace access"
      footer={
        <>
          Already have an account?{" "}
          <Link href="/sign-in" className="font-medium text-atlas-lime-400 hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <SignUpForm />
    </AuthCard>
  );
}
