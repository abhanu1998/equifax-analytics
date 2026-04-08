"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, User } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        setError("Invalid username or password.");
        return;
      }

      const nextPathParam = searchParams.get("next");
      const nextPath =
        nextPathParam &&
        nextPathParam.startsWith("/") &&
        !nextPathParam.startsWith("//")
          ? nextPathParam
          : "/overview";
      router.replace(nextPath);
    } catch {
      setError("Unable to sign in right now. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="shimmer rounded-2xl border border-neutral-800/80 bg-neutral-900/60 p-7"
    >
      <p className="text-[11px] uppercase tracking-[0.23em] text-neutral-500">
        Secure Access
      </p>
      <h1 className="mt-2 text-3xl font-light text-white">Sign in to continue</h1>

      <div className="mt-6 space-y-3">
        <label className="block text-xs text-neutral-400">
          Username
          <span className="mt-1 flex items-center gap-2 rounded-xl border border-neutral-800 bg-neutral-950/80 px-3 py-2">
            <User className="size-4 text-neutral-500" />
            <input
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              className="w-full bg-transparent text-sm text-neutral-100 outline-none"
            />
          </span>
        </label>
        <label className="block text-xs text-neutral-400">
          Password
          <span className="mt-1 flex items-center gap-2 rounded-xl border border-neutral-800 bg-neutral-950/80 px-3 py-2">
            <Lock className="size-4 text-neutral-500" />
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full bg-transparent text-sm text-neutral-100 outline-none"
            />
          </span>
        </label>
      </div>

      {error ? <p className="mt-3 text-sm text-rose-300">{error}</p> : null}

      <Button
        type="submit"
        variant="secondary"
        className="mt-5 h-10 w-full justify-center"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Signing in..." : "Sign In"}
      </Button>
    </form>
  );
}
