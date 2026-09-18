"use client";

import { useState } from "react";
import { useCreateColumn } from "@/hooks/useColumns";

export function NewColumnForm({ boardId }: { boardId: string }) {
  const createColumn = useCreateColumn(boardId);
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState("");

  function submit() {
    if (name.trim()) {
      createColumn.mutate(name.trim());
    }
    setName("");
    setIsAdding(false);
  }

  if (!isAdding) {
    return (
      <button
        onClick={() => setIsAdding(true)}
        className="h-fit w-72 flex-shrink-0 rounded-xl border-2 border-dashed border-ink/20 p-3 text-left text-sm text-ink-soft hover:border-pin/50 hover:text-pin"
      >
        + Add column
      </button>
    );
  }

  return (
    <div className="w-72 flex-shrink-0 rounded-xl bg-ink/[0.04] p-3">
      <input
        autoFocus
        value={name}
        onChange={(event) => setName(event.target.value)}
        onKeyDown={(event) => event.key === "Enter" && submit()}
        placeholder="Column name"
        className="w-full rounded-lg border border-ink/15 bg-paper px-2 py-1.5 text-sm outline-none focus:border-pin focus:ring-1 focus:ring-pin"
      />
      <div className="mt-2 flex gap-2">
        <button
          onClick={submit}
          className="rounded-lg bg-pin px-2.5 py-1 text-xs font-semibold text-white hover:bg-pin/90"
        >
          Add
        </button>
        <button
          onClick={() => setIsAdding(false)}
          className="text-xs font-medium text-ink-soft hover:text-ink"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
