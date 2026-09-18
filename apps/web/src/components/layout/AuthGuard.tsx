"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/hooks/useAuth";
import { AppHeader } from "./AppHeader";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { data, isLoading, isError } = useSession();

  useEffect(() => {
    if (isLoading) return;
    if (isError || !data?.user) {
      router.replace("/login");
    }
  }, [isLoading, isError, data, router]);

  if (isLoading || !data?.user) {
    return (
      <div className="cork-texture flex min-h-screen items-center justify-center text-sm text-ink-soft">
        Loading...
      </div>
    );
  }

  return (
    <div className="cork-texture flex h-screen flex-col">
      <AppHeader />
      <main className="flex min-h-0 flex-1 flex-col">{children}</main>
    </div>
  );
}
