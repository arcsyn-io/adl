import { describe, expect, expectTypeOf, it } from "vitest";

import {
  LANGUAGE_VERSION,
  validateDocument,
  type AdlDocument,
  type LanguageResult,
} from "../src/index.js";
import { minimalDocumentFixture } from "./fixtures.js";

describe("@adl/language public contract", () => {
  it("exposes immutable document types and the supported version", () => {
    expect(LANGUAGE_VERSION).toBe("1.0");
    expectTypeOf<AdlDocument["elements"]>().toMatchTypeOf<readonly unknown[]>();
    expectTypeOf(validateDocument).returns.toEqualTypeOf<LanguageResult>();
  });

  it("returns equivalent results for equivalent inputs without mutating them", () => {
    const input = structuredClone(minimalDocumentFixture);
    const before = structuredClone(input);

    const first = validateDocument(input);
    const second = validateDocument(structuredClone(input));

    expect(first).toEqual(second);
    expect(input).toEqual(before);
    expect(first).toMatchObject({ ok: true });
  });

  it("rejects external values without throwing or returning partial success", () => {
    expect(() => validateDocument(null)).not.toThrow();
    expect(validateDocument(null)).toEqual({
      ok: false,
      errors: [
        {
          code: "INVALID_DOCUMENT",
          message: "Document must be an object.",
          path: "$",
        },
      ],
    });
  });
});
