"use client";

import { useState } from "react";
import Link from "next/link";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { Button } from "@/components/ui/Button";
import { EmptyPinIcon } from "@/components/ui/EmptyPinIcon";
import { NewBoardForm } from "@/components/board/NewBoardForm";
import { useBoards } from "@/hooks/useBoards";

function BoardsView() {
  const { data: boards, isLoading } = useBoards();
  const [isCreating, setIsCreating] = useState(false);

  return (
    <div className="mx-auto h-full max-w-4xl overflow-y-auto px-6 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-ink">Your boards</h1>
        <Button onClick={() => setIsCreating(true)}>New board</Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-ink-soft">Loading...</p>
      ) : boards?.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-ink/15 py-16 text-center">
          <EmptyPinIcon className="h-10 w-10 text-pin/40" />
          <p className="text-sm text-ink-soft">You are not part of any board yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {boards?.map((board, index) => (
            <Link
              key={board.id}
              href={`/boards/${board.id}`}
              className={`rounded-xl bg-paper p-4 shadow-[0_3px_10px_rgba(42,35,26,0.12)] transition-[transform,box-shadow] duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:-translate-y-[3px] hover:rotate-0 hover:shadow-[0_12px_24px_rgba(42,35,26,0.22)] ${
                index % 2 === 0 ? "rotate-[-0.6deg]" : "rotate-[0.6deg]"
              }`}
            >
              <p className="font-semibold text-ink">{board.name}</p>
              <p className="mt-1 text-xs text-ink-soft">
                {board.members.length} member{board.members.length === 1 ? "" : "s"}
              </p>
            </Link>
          ))}
        </div>
      )}

      {isCreating && <NewBoardForm onClose={() => setIsCreating(false)} />}
    </div>
  );
}

export default function BoardsPage() {
  return (
    <AuthGuard>
      <BoardsView />
    </AuthGuard>
  );
}
