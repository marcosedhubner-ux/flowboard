"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { Button } from "@/components/ui/Button";
import { ColumnView } from "@/components/board/ColumnView";
import { NewColumnForm } from "@/components/board/NewColumnForm";
import { CardDetailModal } from "@/components/board/CardDetailModal";
import { AddMemberForm } from "@/components/board/AddMemberForm";
import { PresenceBar } from "@/components/board/PresenceBar";
import { ActivityFeed } from "@/components/board/ActivityFeed";
import { useBoardDetail } from "@/hooks/useBoards";
import { useCreateCard, useMoveCard } from "@/hooks/useCards";
import { useBoardRealtime } from "@/hooks/useRealtime";
import { useSession } from "@/hooks/useAuth";
import type { CardInfo } from "@/lib/types";

function BoardDetailView({ boardId }: { boardId: string }) {
  const viewers = useBoardRealtime(boardId);
  const { data: session } = useSession();
  const { data: board, isLoading } = useBoardDetail(boardId);
  const createCard = useCreateCard(boardId);
  const moveCard = useMoveCard(boardId);
  const [openCard, setOpenCard] = useState<CardInfo | null>(null);
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [draggingCardId, setDraggingCardId] = useState<string | null>(null);

  if (isLoading || !board || !session) {
    return <p className="p-8 text-sm text-ink-soft">Loading board...</p>;
  }

  function handleDropAt(columnId: string, beforeCardId: string | null, afterCardId: string | null) {
    if (!draggingCardId) return;
    if (beforeCardId === draggingCardId || afterCardId === draggingCardId) return;

    moveCard.mutate({ cardId: draggingCardId, columnId, beforeCardId, afterCardId });
    setDraggingCardId(null);
  }

  return (
    <div className="flex h-[calc(100vh-65px)]">
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex items-center justify-between border-b border-ink/10 bg-paper px-6 py-3">
          <h1 className="text-lg font-bold text-ink">{board.name}</h1>
          <div className="flex items-center gap-4">
            <PresenceBar viewers={viewers} />
            <Button variant="secondary" onClick={() => setIsAddingMember(true)}>
              Add member
            </Button>
          </div>
        </div>

        <div className="cork-texture flex flex-1 items-start gap-4 overflow-x-auto p-6">
          {board.columns.map((column) => (
            <ColumnView
              key={column.id}
              column={column}
              onDragStartCard={setDraggingCardId}
              onDropAt={handleDropAt}
              onOpenCard={setOpenCard}
              onAddCard={(columnId, title) => createCard.mutate({ columnId, title })}
            />
          ))}
          <NewColumnForm boardId={boardId} />
        </div>
      </div>

      <ActivityFeed events={board.activity} />

      {openCard && (
        <CardDetailModal
          boardId={boardId}
          card={openCard}
          members={board.members}
          onClose={() => setOpenCard(null)}
        />
      )}
      {isAddingMember && <AddMemberForm boardId={boardId} onClose={() => setIsAddingMember(false)} />}
    </div>
  );
}

export default function BoardDetailPage() {
  const params = useParams<{ id: string }>();

  return (
    <AuthGuard>
      <BoardDetailView boardId={params.id} />
    </AuthGuard>
  );
}
