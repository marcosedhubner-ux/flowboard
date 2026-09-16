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
      className={`flex w-72 flex-shrink-0 flex-col rounded-xl bg-slate-100 p-3 ${
        isDragOver ? "ring-2 ring-violet-400" : ""
      }`}
    >
      <div className="mb-2 flex items-center justify-between px-1">
        <h3 className="text-sm font-semibold text-slate-700">{column.name}</h3>
        <span className="text-xs text-slate-400">{column.cards.length}</span>
      </div>

      <div className="flex flex-col gap-2">
        {column.cards.map((card, index) => (
          <CardItem
            key={card.id}
            card={card}
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
            className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm outline-none focus:border-violet-600 focus:ring-1 focus:ring-violet-600"
          />
          <div className="flex gap-2">
            <button
              onClick={submitNewCard}
              className="rounded-lg bg-violet-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-violet-500"
            >
              Add
            </button>
            <button
              onClick={() => {
                setIsAdding(false);
                setTitle("");
              }}
              className="text-xs font-medium text-slate-500 hover:text-slate-700"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsAdding(true)}
          className="mt-2 rounded-lg px-2 py-1.5 text-left text-sm text-slate-500 hover:bg-slate-200"
        >
          + Add a card
        </button>
      )}
    </div>
  );
}
