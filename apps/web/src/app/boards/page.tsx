"use client";

import { useState } from "react";
import Link from "next/link";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { Button } from "@/components/ui/Button";
import { NewBoardForm } from "@/components/board/NewBoardForm";
import { useBoards } from "@/hooks/useBoards";

function BoardsView() {
  const { data: boards, isLoading } = useBoards();
  const [isCreating, setIsCreating] = useState(false);

  return (
    <div className="cork-texture mx-auto min-h-[calc(100vh-65px)] max-w-4xl px-6 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-ink">Your boards</h1>
        <Button onClick={() => setIsCreating(true)}>New board</Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-ink-soft">Loading...</p>
      ) : boards?.length === 0 ? (
        <p className="text-sm text-ink-soft">You are not part of any board yet.</p>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {boards?.map((board, index) => (
            <Link
              key={board.id}
              href={`/boards/${board.id}`}
              className={`rounded-xl bg-paper p-4 shadow-[0_3px_10px_rgba(42,35,26,0.12)] transition-transform duration-150 ease-out hover:rotate-0 hover:shadow-[0_5px_14px_rgba(42,35,26,0.16)] ${
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
