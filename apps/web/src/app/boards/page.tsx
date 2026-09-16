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
    <div className="mx-auto max-w-4xl px-6 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Your boards</h1>
        <Button onClick={() => setIsCreating(true)}>New board</Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-slate-400">Loading...</p>
      ) : boards?.length === 0 ? (
        <p className="text-sm text-slate-400">You are not part of any board yet.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {boards?.map((board) => (
            <Link
              key={board.id}
              href={`/boards/${board.id}`}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md"
            >
              <p className="font-semibold text-slate-900">{board.name}</p>
              <p className="mt-1 text-xs text-slate-400">
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
