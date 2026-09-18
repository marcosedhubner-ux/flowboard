"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLogout, useSession } from "@/hooks/useAuth";

export function AppHeader() {
  const router = useRouter();
  const { data } = useSession();
  const logout = useLogout();

  return (
    <header className="px-5 pt-5 pb-2 sm:px-8 sm:pt-6">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <Link href="/boards" className="inline-flex items-center gap-2 text-base font-bold tracking-tight text-ink">
          <span className="inline-block h-2 w-2 rounded-full bg-pin-coral" aria-hidden />
          Corkboard
        </Link>
        {data?.user && (
          <div className="flex items-center gap-3 rounded-full bg-paper/85 py-1.5 pl-3.5 pr-2 shadow-[0_2px_8px_rgba(42,35,26,0.10)] backdrop-blur-sm">
            <p className="text-sm font-medium text-ink">{data.user.fullName}</p>
            <span className="h-3 w-px bg-ink/15" aria-hidden />
            <button
              onClick={() => logout.mutate(undefined, { onSuccess: () => router.push("/login") })}
              className="rounded-full px-2 py-1 text-xs font-medium text-ink-soft hover:bg-ink/5 hover:text-ink"
            >
              Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
