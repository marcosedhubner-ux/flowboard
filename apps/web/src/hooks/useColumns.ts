import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import type { ColumnInfo } from "@/lib/types";

export function useCreateColumn(boardId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => apiClient.post<{ column: ColumnInfo }>(`/boards/${boardId}/columns`, { name }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["boards", boardId] }),
  });
}
