"use client";

import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getSocket } from "@/lib/socket";
import type { PresenceViewer } from "@/lib/types";

export function useBoardRealtime(boardId: string) {
  const queryClient = useQueryClient();
  const [viewers, setViewers] = useState<PresenceViewer[]>([]);

  useEffect(() => {
    if (!boardId) return;
    const socket = getSocket();

    const handleUpdate = () => {
      queryClient.invalidateQueries({ queryKey: ["boards", boardId] });
    };

    const handlePresence = (payload: { boardId: string; viewers: PresenceViewer[] }) => {
      if (payload.boardId === boardId) {
        setViewers(payload.viewers);
      }
    };

    socket.emit("board:view", boardId);
    socket.on("board:updated", handleUpdate);
    socket.on("presence:update", handlePresence);

    return () => {
      socket.emit("board:leave");
      socket.off("board:updated", handleUpdate);
      socket.off("presence:update", handlePresence);
    };
  }, [boardId, queryClient]);

  return viewers;
}
