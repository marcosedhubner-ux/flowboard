"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useCreateBoard } from "@/hooks/useBoards";
import { ApiError } from "@/lib/apiClient";

export function NewBoardForm({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const createBoard = useCreateBoard();
  const [name, setName] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setErrorMessage(null);

    createBoard.mutate(name, {
      onSuccess: (data) => {
        onClose();
        router.push(`/boards/${data.board.id}`);
      },
      onError: (err) => {
        setErrorMessage(err instanceof ApiError ? err.message : "Something went wrong");
      },
    });
  }

  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-slate-900/30" onClick={onClose}>
      <div
        className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 className="text-lg font-bold text-slate-900">New board</h2>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Board name</label>
            <input
              required
              autoFocus
              placeholder="Product Launch"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-violet-600 focus:ring-1 focus:ring-violet-600"
            />
          </div>

          {errorMessage && (
            <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{errorMessage}</p>
          )}

          <div className="flex gap-2">
            <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={createBoard.isPending}>
              {createBoard.isPending ? "Creating..." : "Create"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
