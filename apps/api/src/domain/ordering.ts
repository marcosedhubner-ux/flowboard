const INITIAL_GAP = 65536;
const MIN_GAP = 1e-6;

export function firstPosition(): number {
  return INITIAL_GAP;
}

export function positionAfter(lastPosition: number | null): number {
  return lastPosition === null ? INITIAL_GAP : lastPosition + INITIAL_GAP;
}

export function positionBetween(before: number | null, after: number | null): number {
  if (before === null && after === null) return INITIAL_GAP;
  if (before === null) return after! / 2;
  if (after === null) return before + INITIAL_GAP;
  return before + (after - before) / 2;
}

export function needsRebalance(before: number | null, after: number | null): boolean {
  if (before === null || after === null) return false;
  return after - before < MIN_GAP;
}

export function rebalancedPositions(count: number): number[] {
  return Array.from({ length: count }, (_, index) => (index + 1) * INITIAL_GAP);
}
