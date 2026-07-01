export {
  COMMENT_PREFIXES,
  IDENTIFIER_PATTERN,
  LANGUAGE_VERSION,
  RESERVED_WORDS,
} from "./syntax.js";
export type {
  AdlDocument,
  AdlElement,
  AdlGroup,
  AdlProperties,
  AdlRelation,
  LanguageError,
  LanguageErrorCode,
  LanguageResult,
} from "./syntax.js";
export { validateDocument } from "./version.js";
