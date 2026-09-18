"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLogin } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { ApiError } from "@/lib/apiClient";

const DEMO_ACCOUNTS = ["nova@flowboard.dev", "priya@flowboard.dev", "theo@flowboard.dev"];

export default function LoginPage() {
  const router = useRouter();
  const login = useLogin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setErrorMessage(null);
    login.mutate(
      { email, password },
      {
        onSuccess: () => router.push("/"),
        onError: (err) => {
          setErrorMessage(err instanceof ApiError ? err.message : "Something went wrong");
        },
      }
    );
  }

  return (
    <div className="cork-texture flex min-h-screen flex-col items-center justify-center gap-8 px-6 py-16">
      <div className="w-full max-w-sm text-center">
        <span className="inline-flex items-center gap-2 text-2xl font-bold tracking-tight text-ink">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-pin-coral" aria-hidden />
          Corkboard
        </span>
        <p className="mt-3 text-lg leading-snug text-ink-soft">
          Drag a card and everyone watching the board sees it move in the same second — no
          refresh, no merge conflicts.
        </p>
      </div>

      <div className="relative w-full max-w-sm rotate-[-0.6deg] rounded-xl bg-paper p-8 shadow-[0_3px_10px_rgba(42,35,26,0.12)] transition-transform duration-150 ease-out hover:rotate-0">
        <span
          aria-hidden
          className="absolute -top-1.5 left-1/2 h-[9px] w-[9px] -translate-x-1/2 rounded-full bg-pin ring-2 ring-paper"
        />
        <h1 className="text-2xl font-bold text-ink">Sign in</h1>
        <p className="mt-1 text-sm text-ink-soft">Welcome back.</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink-soft" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-1 w-full rounded-lg border border-ink/15 px-3 py-2 text-sm outline-none focus:border-pin focus:ring-1 focus:ring-pin"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-soft" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-1 w-full rounded-lg border border-ink/15 px-3 py-2 text-sm outline-none focus:border-pin focus:ring-1 focus:ring-pin"
            />
          </div>

          {errorMessage && (
            <p className="rounded-lg bg-pin-coral/10 px-3 py-2 text-sm text-danger">{errorMessage}</p>
          )}

          <Button type="submit" className="w-full" disabled={login.isPending}>
            {login.isPending ? "Signing in..." : "Sign in"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-ink-soft">
          New here?{" "}
          <Link href="/register" className="font-medium text-pin hover:underline">
            Create an account
          </Link>
        </p>

        <div className="mt-8 rounded-lg border border-dashed border-ink/20 p-4">
          <p className="font-[family-name:var(--font-hand)] text-sm text-ink-soft">
            Demo accounts (password: Passw0rd!123)
          </p>
          <ul className="mt-2 space-y-1">
            {DEMO_ACCOUNTS.map((email) => (
              <li key={email} className="font-mono text-xs text-ink-soft">
                {email}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
