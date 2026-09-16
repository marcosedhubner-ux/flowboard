import { describe, expect, it } from "vitest";
import {
  firstPosition,
  needsRebalance,
  positionAfter,
  positionBetween,
  rebalancedPositions,
} from "../src/domain/ordering.js";

describe("positionAfter", () => {
  it("returns the initial gap for the first item in an empty column", () => {
    expect(positionAfter(null)).toBe(65536);
  });

  it("adds a full gap after the last item", () => {
    expect(positionAfter(65536)).toBe(131072);
  });
});

describe("positionBetween", () => {
  it("returns the initial gap when the column is empty", () => {
    expect(positionBetween(null, null)).toBe(65536);
  });

  it("halves the following position when dropped at the very start", () => {
    expect(positionBetween(null, 100)).toBe(50);
  });

  it("adds a full gap when dropped at the very end", () => {
    expect(positionBetween(100, null)).toBe(100 + 65536);
  });

  it("picks the midpoint when dropped between two cards", () => {
    expect(positionBetween(100, 200)).toBe(150);
  });

  it("keeps ordering: before < between < after", () => {
    const between = positionBetween(100, 200);
    expect(between).toBeGreaterThan(100);
    expect(between).toBeLessThan(200);
  });
});

describe("needsRebalance", () => {
  it("is false when there is room between two positions", () => {
    expect(needsRebalance(100, 200)).toBe(false);
  });

  it("is false at either end of a column, since there is always room", () => {
    expect(needsRebalance(null, 200)).toBe(false);
    expect(needsRebalance(100, null)).toBe(false);
  });

  it("becomes true once repeated insertions have collapsed the gap", () => {
    let before = 100;
    let after = 200;
    for (let i = 0; i < 30; i++) {
      const mid = positionBetween(before, after);
      after = mid;
    }
    expect(needsRebalance(before, after)).toBe(true);
  });
});

describe("rebalancedPositions", () => {
  it("produces the requested count of strictly increasing, evenly spaced values", () => {
    const positions = rebalancedPositions(5);
    expect(positions).toHaveLength(5);
    for (let i = 1; i < positions.length; i++) {
      expect(positions[i]).toBeGreaterThan(positions[i - 1]!);
    }
  });

  it("leaves plenty of room between consecutive rebalanced positions", () => {
    const positions = rebalancedPositions(3);
    for (let i = 1; i < positions.length; i++) {
      expect(positions[i]! - positions[i - 1]!).toBe(65536);
    }
  });
});
