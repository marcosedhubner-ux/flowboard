import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import type { BoardDetail, BoardSummary } from "@/lib/types";

export function useBoards() {
  return useQuery({
    queryKey: ["boards"],
    queryFn: () => apiClient.get<{ boards: BoardSummary[] }>("/boards"),
    select: (data) => data.boards,
  });
}

export function useCreateBoard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => apiClient.post<{ board: BoardSummary }>("/boards", { name }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["boards"] }),
  });
}

export function useBoardDetail(boardId: string) {
  return useQuery({
    queryKey: ["boards", boardId],
    queryFn: () => apiClient.get<{ board: BoardDetail }>(`/boards/${boardId}`),
    select: (data) => data.board,
    enabled: Boolean(boardId),
  });
}

export function useAddBoardMember(boardId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (email: string) => apiClient.post(`/boards/${boardId}/members`, { email }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["boards", boardId] });
      queryClient.invalidateQueries({ queryKey: ["boards"] });
    },
  });
}
