import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import Image from "next/image";
import { LoginForm } from "@/components/auth/login-form";
import { verifySessionToken } from "@/lib/auth";
import { SESSION_COOKIE_NAME } from "@/lib/constants";

export default async function LoginPage() {
  const token = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
  const session = await verifySessionToken(token);

  if (session) {
    redirect("/overview");
  }

  return (
    <div className="premium-grid flex min-h-screen items-center justify-center p-5">
      <div className="w-full max-w-md">
        <div className="mb-4 rounded-2xl border border-neutral-800/80 bg-neutral-900/50 px-6 py-5 text-center">
          <Image
            src="/equifax-logo.svg"
            alt="Equifax"
            width={220}
            height={44}
            priority
            className="mx-auto h-auto w-auto max-w-[220px]"
          />
          <p className="mt-3 text-xs uppercase tracking-[0.2em] text-neutral-400">
            Analytics Intelligence Portal
          </p>
        </div>
        <Suspense fallback={<div className="shimmer h-[320px] rounded-2xl border border-neutral-800 bg-neutral-900/60" />}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
