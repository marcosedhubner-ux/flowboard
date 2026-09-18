"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { useDeleteCard, useUpdateCard } from "@/hooks/useCards";
import type { BoardMemberInfo, CardInfo } from "@/lib/types";

export function CardDetailModal({
  boardId,
  card,
  members,
  onClose,
}: {
  boardId: string;
  card: CardInfo;
  members: BoardMemberInfo[];
  onClose: () => void;
}) {
  const updateCard = useUpdateCard(boardId);
  const deleteCard = useDeleteCard(boardId);
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description ?? "");
  const [assigneeId, setAssigneeId] = useState(card.assignee?.id ?? "");

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    updateCard.mutate(
      { cardId: card.id, title, description: description || null, assigneeId: assigneeId || null },
      { onSuccess: onClose }
    );
  }

  function handleDelete() {
    deleteCard.mutate(card.id, { onSuccess: onClose });
  }

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-ink/40" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-xl bg-paper p-6 shadow-[0_10px_30px_rgba(42,35,26,0.25)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-ink">Card details</h2>
          <button onClick={onClose} className="text-ink-soft hover:text-ink">
            Close
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink-soft">Title</label>
            <input
              required
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="mt-1 w-full rounded-lg border border-ink/15 px-3 py-2 text-sm outline-none focus:border-pin focus:ring-1 focus:ring-pin"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-soft">Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className="mt-1 w-full rounded-lg border border-ink/15 px-3 py-2 text-sm outline-none focus:border-pin focus:ring-1 focus:ring-pin"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-soft">Assignee</label>
            <select
              value={assigneeId}
              onChange={(event) => setAssigneeId(event.target.value)}
              className="mt-1 w-full rounded-lg border border-ink/15 px-3 py-2 text-sm outline-none focus:border-pin focus:ring-1 focus:ring-pin"
            >
              <option value="">Unassigned</option>
              {members.map((member) => (
                <option key={member.userId} value={member.userId}>
                  {member.user.fullName}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={handleDelete}
              className="text-sm font-medium text-danger hover:underline"
            >
              Delete card
            </button>
            <Button type="submit" disabled={updateCard.isPending}>
              {updateCard.isPending ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
