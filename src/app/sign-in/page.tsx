import Link from "next/link";
import { AuthCard } from "@/components/auth-card";
import { SignInForm } from "@/components/sign-in-form";

export const metadata = { title: "Sign in — TakeHome" };

export default function SignInPage() {
  return (
    <AuthCard
      title="Sign in"
      subtitle="Secure workspace access"
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link href="/sign-up" className="font-medium text-atlas-lime-400 hover:underline">
            Create one
          </Link>
        </>
      }
    >
      <SignInForm />
    </AuthCard>
  );
}
