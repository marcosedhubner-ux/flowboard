"use client";

import { useState, type DragEvent } from "react";
import { Avatar } from "@/components/ui/Avatar";
import type { CardInfo } from "@/lib/types";

const PIN_COLORS = ["bg-pin", "bg-pin-amber", "bg-pin-coral"];

export function CardItem({
  card,
  index,
  previousCardId,
  nextCardId,
  columnId,
  onDragStart,
  onDropAt,
  onOpen,
}: {
  card: CardInfo;
  index: number;
  previousCardId: string | null;
  nextCardId: string | null;
  columnId: string;
  onDragStart: (cardId: string) => void;
  onDropAt: (columnId: string, beforeCardId: string | null, afterCardId: string | null) => void;
  onOpen: (card: CardInfo) => void;
}) {
  const [isDragging, setIsDragging] = useState(false);

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

  // A couple tenths of a degree of alternating tilt reads as a hand-pinned
  // card; the tilt resets to dead straight while the card is being dragged
  // or hovered so the interaction itself never feels crooked.
  const restingTilt = index % 2 === 0 ? "rotate-[-0.6deg]" : "rotate-[0.6deg]";
  const pinColor = PIN_COLORS[index % PIN_COLORS.length];

  // While dragging, the browser's own drag image takes over, so the source
  // element is pinned flat and dimmed rather than lifted — the lift/hover
  // treatment below is deliberately withheld during drag so the two
  // transforms never fight each other.
  const restStateClasses = isDragging
    ? "translate-y-0 rotate-0 opacity-70 shadow-[0_3px_10px_rgba(42,35,26,0.12)]"
    : `${restingTilt} translate-y-0 shadow-[0_3px_10px_rgba(42,35,26,0.12)] hover:-translate-y-[3px] hover:rotate-0 hover:shadow-[0_12px_24px_rgba(42,35,26,0.22)]`;

  return (
    <div
      draggable
      onDragStart={(event) => {
        event.dataTransfer.setData("text/plain", card.id);
        setIsDragging(true);
        onDragStart(card.id);
      }}
      onDragEnd={() => setIsDragging(false)}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={() => onOpen(card)}
      className={`group relative cursor-grab space-y-2 rounded-xl bg-paper p-3 pt-4 transition-[transform,box-shadow] duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] active:cursor-grabbing ${restStateClasses}`}
    >
      <span
        aria-hidden
        className={`absolute -top-1 left-1/2 h-[7px] w-[7px] -translate-x-1/2 rounded-full ring-2 ring-paper ${pinColor}`}
      />
      <p className="text-sm font-medium text-ink">{card.title}</p>
      {card.description && <p className="line-clamp-2 text-xs text-ink-soft">{card.description}</p>}
      {card.assignee && (
        <div className="flex justify-end">
          <Avatar fullName={card.assignee.fullName} />
        </div>
      )}
    </div>
  );
}
