"use client";

import { useState, type DragEvent } from "react";
import { CardItem } from "./CardItem";
import type { CardInfo, ColumnInfo } from "@/lib/types";

export function ColumnView({
  column,
  onDragStartCard,
  onDropAt,
  onOpenCard,
  onAddCard,
}: {
  column: ColumnInfo;
  onDragStartCard: (cardId: string) => void;
  onDropAt: (columnId: string, beforeCardId: string | null, afterCardId: string | null) => void;
  onOpenCard: (card: CardInfo) => void;
  onAddCard: (columnId: string, title: string) => void;
}) {
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);

  function handleDragOver(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragOver(true);
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragOver(false);
    const lastCard = column.cards[column.cards.length - 1];
    onDropAt(column.id, lastCard?.id ?? null, null);
  }

  function submitNewCard() {
    if (title.trim()) {
      onAddCard(column.id, title.trim());
    }
    setTitle("");
    setIsAdding(false);
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={handleDrop}
      className={`flex w-72 flex-shrink-0 flex-col rounded-xl bg-ink/[0.04] p-3 ${
        isDragOver ? "ring-2 ring-pin/50" : ""
      }`}
    >
      <div className="mb-2 flex items-center justify-between px-1">
        <h3 className="font-[family-name:var(--font-hand)] text-lg font-semibold text-ink">
          {column.name}
        </h3>
        <span className="text-xs text-ink-soft">{column.cards.length}</span>
      </div>

      <div className="flex flex-col gap-3 pt-1">
        {column.cards.map((card, index) => (
          <CardItem
            key={card.id}
            card={card}
            index={index}
            columnId={column.id}
            previousCardId={column.cards[index - 1]?.id ?? null}
            nextCardId={column.cards[index + 1]?.id ?? null}
            onDragStart={onDragStartCard}
            onDropAt={onDropAt}
            onOpen={onOpenCard}
          />
        ))}
      </div>

      {isAdding ? (
        <div className="mt-2 space-y-2">
          <textarea
            autoFocus
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                submitNewCard();
              }
            }}
            placeholder="Card title"
            rows={2}
            className="w-full rounded-lg border border-ink/15 bg-paper px-2 py-1.5 text-sm outline-none focus:border-pin focus:ring-1 focus:ring-pin"
          />
          <div className="flex gap-2">
            <button
              onClick={submitNewCard}
              className="rounded-lg bg-pin px-2.5 py-1 text-xs font-semibold text-white hover:bg-pin/90"
            >
              Add
            </button>
            <button
              onClick={() => {
                setIsAdding(false);
                setTitle("");
              }}
              className="text-xs font-medium text-ink-soft hover:text-ink"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsAdding(true)}
          className="mt-2 rounded-lg px-2 py-1.5 text-left text-sm text-ink-soft hover:bg-ink/5"
        >
          + Add a card
        </button>
      )}
    </div>
  );
}
