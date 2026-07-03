import { describe, expect, it } from "vitest";
import { commitTransaction, createHistory, redo, undo, type WorkspaceTransaction } from "../src/index.js";

const transaction = (id: number, groupKey?: string): WorkspaceTransaction<number> => ({ id: String(id), origin: "canvas", description: `change ${id}`, before: id, after: id + 1, createdAt: id, groupKey });

describe("workspace history", () => {
  it("undoes, redoes and clears a future branch", () => {
    let history = commitTransaction(createHistory<number>(), transaction(0));
    const undone = undo(history);
    expect(undone?.snapshot).toBe(0);
    history = commitTransaction(undone!.history, transaction(5));
    expect(redo(history)).toBeUndefined();
  });

  it("coalesces a group and retains at most 100 entries", () => {
    let history = createHistory<number>();
    history = commitTransaction(history, transaction(0, "typing"));
    history = commitTransaction(history, transaction(1, "typing"));
    expect(history.past).toHaveLength(1);
    for (let index = 2; index < 104; index++) history = commitTransaction(history, transaction(index));
    expect(history.past).toHaveLength(100);
  });
});
