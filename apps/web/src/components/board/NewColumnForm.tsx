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
        className="h-fit w-72 flex-shrink-0 rounded-xl border-2 border-dashed border-slate-300 p-3 text-left text-sm text-slate-500 hover:border-violet-400 hover:text-violet-600"
      >
        + Add column
      </button>
    );
  }

  return (
    <div className="w-72 flex-shrink-0 rounded-xl bg-slate-100 p-3">
      <input
        autoFocus
        value={name}
        onChange={(event) => setName(event.target.value)}
        onKeyDown={(event) => event.key === "Enter" && submit()}
        placeholder="Column name"
        className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm outline-none focus:border-violet-600 focus:ring-1 focus:ring-violet-600"
      />
      <div className="mt-2 flex gap-2">
        <button
          onClick={submit}
          className="rounded-lg bg-violet-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-violet-500"
        >
          Add
        </button>
        <button
          onClick={() => setIsAdding(false)}
          className="text-xs font-medium text-slate-500 hover:text-slate-700"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
