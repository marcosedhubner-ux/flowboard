import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import type { BoardDetail, CardInfo } from "@/lib/types";

interface CreateCardInput {
  columnId: string;
  title: string;
  description?: string;
  assigneeId?: string;
}

interface UpdateCardInput {
  title?: string;
  description?: string | null;
  assigneeId?: string | null;
}

interface MoveCardInput {
  cardId: string;
  columnId: string;
  beforeCardId: string | null;
  afterCardId: string | null;
}

export function useCreateCard(boardId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateCardInput) =>
      apiClient.post<{ card: CardInfo }>(`/boards/${boardId}/cards`, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["boards", boardId] }),
  });
}

export function useUpdateCard(boardId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ cardId, ...input }: UpdateCardInput & { cardId: string }) =>
      apiClient.patch<{ card: CardInfo }>(`/boards/${boardId}/cards/${cardId}`, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["boards", boardId] }),
  });
}

export function useDeleteCard(boardId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (cardId: string) => apiClient.delete(`/boards/${boardId}/cards/${cardId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["boards", boardId] }),
  });
}

export function useMoveCard(boardId: string) {
  const queryClient = useQueryClient();
  const queryKey = ["boards", boardId];

  return useMutation({
    mutationFn: ({ cardId, ...input }: MoveCardInput) =>
      apiClient.patch<{ card: CardInfo }>(`/boards/${boardId}/cards/${cardId}/move`, input),

    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<{ board: BoardDetail }>(queryKey);

      queryClient.setQueryData<{ board: BoardDetail }>(queryKey, (current) => {
        if (!current) return current;

        const allCards = current.board.columns.flatMap((column) => column.cards);
        const movingCard = allCards.find((card) => card.id === variables.cardId);
        if (!movingCard) return current;

        const columns = current.board.columns.map((column) => ({
          ...column,
          cards: column.cards.filter((card) => card.id !== variables.cardId),
        }));

        const targetColumn = columns.find((column) => column.id === variables.columnId);
        if (!targetColumn) return current;

        const insertIndex = variables.beforeCardId
          ? targetColumn.cards.findIndex((c) => c.id === variables.beforeCardId) + 1
          : 0;

        targetColumn.cards.splice(insertIndex, 0, { ...movingCard, columnId: variables.columnId });

        return { board: { ...current.board, columns } };
      });

      return { previous };
    },

    onError: (_err, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
}
