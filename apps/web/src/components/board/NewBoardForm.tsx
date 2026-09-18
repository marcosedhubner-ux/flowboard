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
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-ink/30" onClick={onClose}>
      <div
        className="w-full max-w-sm rounded-xl bg-paper p-6 shadow-[0_10px_30px_rgba(42,35,26,0.25)]"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 className="text-lg font-bold text-ink">New board</h2>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink-soft">Board name</label>
            <input
              required
              autoFocus
              placeholder="Product Launch"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="mt-1 w-full rounded-lg border border-ink/15 px-3 py-2 text-sm outline-none focus:border-pin focus:ring-1 focus:ring-pin"
            />
          </div>

          {errorMessage && (
            <p className="rounded-lg bg-pin-coral/10 px-3 py-2 text-sm text-danger">{errorMessage}</p>
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
