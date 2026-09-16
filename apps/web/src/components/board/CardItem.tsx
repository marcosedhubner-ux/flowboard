"use client";

import type { DragEvent } from "react";
import { Avatar } from "@/components/ui/Avatar";
import type { CardInfo } from "@/lib/types";

export function CardItem({
  card,
  previousCardId,
  nextCardId,
  columnId,
  onDragStart,
  onDropAt,
  onOpen,
}: {
  card: CardInfo;
  previousCardId: string | null;
  nextCardId: string | null;
  columnId: string;
  onDragStart: (cardId: string) => void;
  onDropAt: (columnId: string, beforeCardId: string | null, afterCardId: string | null) => void;
  onOpen: (card: CardInfo) => void;
}) {
  function handleDragOver(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    event.stopPropagation();

    const rect = event.currentTarget.getBoundingClientRect();
    const isAboveMidpoint = event.clientY < rect.top + rect.height / 2;

    if (isAboveMidpoint) {
      onDropAt(columnId, previousCardId, card.id);
    } else {
      onDropAt(columnId, card.id, nextCardId);
    }
  }

  return (
    <div
      draggable
      onDragStart={(event) => {
        event.dataTransfer.setData("text/plain", card.id);
        onDragStart(card.id);
      }}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={() => onOpen(card)}
      className="cursor-grab space-y-2 rounded-lg border border-slate-200 bg-white p-3 shadow-sm active:cursor-grabbing"
    >
      <p className="text-sm font-medium text-slate-800">{card.title}</p>
      {card.description && <p className="line-clamp-2 text-xs text-slate-500">{card.description}</p>}
      {card.assignee && (
        <div className="flex justify-end">
          <Avatar fullName={card.assignee.fullName} />
        </div>
      )}
    </div>
  );
}
