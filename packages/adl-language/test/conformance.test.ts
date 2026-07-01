import { describe, expect, it } from "vitest";

import {
  COMMENT_PREFIXES,
  IDENTIFIER_PATTERN,
  RESERVED_WORDS,
  validateDocument,
} from "../src/index.js";
import {
  metadataAndGroupingDocumentFixture,
  minimalDocumentFixture,
  unsupportedVersionDocumentFixture,
} from "./fixtures.js";

describe("ADL language conformance", () => {
  describe("User Story 1 - minimal diagrams", () => {
    it("accepts two elements and one directional relation unambiguously", () => {
      expect(validateDocument(minimalDocumentFixture)).toEqual({
        ok: true,
        document: minimalDocumentFixture,
      });
    });

    it("rejects duplicate identifiers and unresolved relation references", () => {
      const result = validateDocument({
        ...minimalDocumentFixture,
        elements: [
          minimalDocumentFixture.elements[0],
          minimalDocumentFixture.elements[0],
          minimalDocumentFixture.elements[1],
        ],
        relations: [{ id: "calls", source: "missing", target: "api" }],
      });

      expect(result).toMatchObject({
        ok: false,
        errors: [
          { code: "DUPLICATE_ID", path: "$.elements[1].id" },
          { code: "UNRESOLVED_REFERENCE", path: "$.relations[0].source" },
        ],
      });
    });

    it("defines case-sensitive identifiers and rejects reserved words", () => {
      expect(IDENTIFIER_PATTERN.test("Orders_API-2")).toBe(true);
      expect(RESERVED_WORDS).toContain("diagram");
      expect(
        validateDocument({
          ...minimalDocumentFixture,
          elements: [{ id: "diagram", name: "Reserved", type: "service" }],
          relations: [],
        }),
      ).toMatchObject({ ok: false, errors: [{ code: "RESERVED_IDENTIFIER" }] });
    });
  });

  describe("User Story 2 - metadata and grouping", () => {
    it("accepts descriptions, string properties and logical groups", () => {
      expect(validateDocument(metadataAndGroupingDocumentFixture)).toEqual({
        ok: true,
        document: metadataAndGroupingDocumentFixture,
      });
    });

    it("applies observable defaults to optional collections", () => {
      expect(
        validateDocument({
          version: "1.0",
          elements: [{ id: "api", name: "API", type: "service" }],
        }),
      ).toEqual({
        ok: true,
        document: {
          version: "1.0",
          elements: [{ id: "api", name: "API", type: "service" }],
          relations: [],
          groups: [],
        },
      });
    });

    it("rejects visual geometry and non-string property values", () => {
      expect(
        validateDocument({
          version: "1.0",
          elements: [
            { id: "api", name: "API", type: "service", x: 10, properties: { replicas: 2 } },
          ],
        }),
      ).toMatchObject({
        ok: false,
        errors: [
          { code: "VISUAL_STATE_FORBIDDEN", path: "$.elements[0].x" },
          { code: "INVALID_PROPERTY", path: "$.elements[0].properties.replicas" },
        ],
      });
    });

    it("documents comments and Unicode string content at the language boundary", () => {
      expect(COMMENT_PREFIXES).toEqual(["//", "#"]);
      expect(
        validateDocument({
          version: "1.0",
          elements: [{ id: "servico", name: "Serviço de pedidos 🚀", type: "service" }],
        }),
      ).toMatchObject({ ok: true });
    });
  });

  describe("User Story 3 - explicit compatibility", () => {
    it("rejects unsupported versions with a stable identifiable error", () => {
      expect(validateDocument(unsupportedVersionDocumentFixture)).toEqual({
        ok: false,
        errors: [
          {
            code: "UNSUPPORTED_VERSION",
            message: 'Unsupported ADL version "999.0". Supported version: "1.0".',
            path: "$.version",
          },
        ],
      });
    });

    it("rejects empty and comment-only source representations", () => {
      expect(validateDocument("")).toMatchObject({ ok: false, errors: [{ code: "INVALID_DOCUMENT" }] });
      expect(validateDocument("// only a comment")).toMatchObject({
        ok: false,
        errors: [{ code: "INVALID_DOCUMENT" }],
      });
    });
  });
});
