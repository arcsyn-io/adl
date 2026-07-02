import { describe, expect, it } from "vitest";
import { lex, parse } from "../src/index.js";
import { minimalSource } from "./fixtures.js";

describe("@adl/parser contract", () => {
  it("returns deterministic immutable-looking data without throwing", () => {
    expect(parse(minimalSource)).toEqual(parse(minimalSource));
    expect(() => parse("\u0000")).not.toThrow();
  });

  it("classifies whitespace, comments and invalid tokens", () => {
    const tokens = lex(" # note\n@ ");
    expect(tokens.map((token) => token.kind)).toEqual(["Whitespace", "Comment", "Whitespace", "Invalid", "Whitespace", "Eof"]);
  });
});
