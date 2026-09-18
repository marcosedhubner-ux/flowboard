"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/hooks/useAuth";

export default function HomePage() {
  const router = useRouter();
  const { data, isLoading, isError } = useSession();

  useEffect(() => {
    if (isLoading) return;
    if (isError || !data?.user) {
      router.replace("/login");
      return;
    }
    router.replace("/boards");
  }, [data, isLoading, isError, router]);

  return (
    <div className="cork-texture flex min-h-screen items-center justify-center text-sm text-ink-soft">
      Loading...
    </div>
  );
}
