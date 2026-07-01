import {
  IDENTIFIER_PATTERN,
  LANGUAGE_VERSION,
  RESERVED_WORDS,
  type AdlDocument,
  type AdlElement,
  type AdlGroup,
  type AdlProperties,
  type AdlRelation,
  type LanguageError,
  type LanguageResult,
} from "./syntax.js";

type UnknownRecord = Record<string, unknown>;

const visualStateFields = new Set([
  "x",
  "y",
  "width",
  "height",
  "position",
  "coordinates",
]);

const reservedWords = new Set<string>(RESERVED_WORDS);

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function addError(
  errors: LanguageError[],
  code: LanguageError["code"],
  message: string,
  path: string,
): void {
  errors.push({ code, message, path });
}

function readRequiredString(
  value: UnknownRecord,
  key: string,
  path: string,
  errors: LanguageError[],
): string | undefined {
  if (!(key in value)) {
    addError(errors, "MISSING_FIELD", `Required field "${key}" is missing.`, `${path}.${key}`);
    return undefined;
  }

  const field = value[key];
  if (typeof field !== "string" || field.length === 0) {
    addError(errors, "INVALID_FIELD", `Field "${key}" must be a non-empty string.`, `${path}.${key}`);
    return undefined;
  }

  return field;
}

function readOptionalString(
  value: UnknownRecord,
  key: string,
  path: string,
  errors: LanguageError[],
): string | undefined {
  const field = value[key];
  if (field === undefined) return undefined;
  if (typeof field !== "string") {
    addError(errors, "INVALID_FIELD", `Field "${key}" must be a string.`, `${path}.${key}`);
    return undefined;
  }
  return field;
}

function validateIdentifier(id: string | undefined, path: string, errors: LanguageError[]): void {
  if (id === undefined) return;
  if (!IDENTIFIER_PATTERN.test(id)) {
    addError(
      errors,
      "INVALID_IDENTIFIER",
      `Identifier "${id}" must start with an ASCII letter and contain only letters, digits, _ or -.`,
      path,
    );
  } else if (reservedWords.has(id)) {
    addError(errors, "RESERVED_IDENTIFIER", `Identifier "${id}" is reserved.`, path);
  }
}

function validateVisualState(value: UnknownRecord, path: string, errors: LanguageError[]): void {
  for (const key of Object.keys(value)) {
    if (visualStateFields.has(key)) {
      addError(
        errors,
        "VISUAL_STATE_FORBIDDEN",
        `Visual state field "${key}" is not allowed in an ADL document.`,
        `${path}.${key}`,
      );
    }
  }
}

function readProperties(
  value: UnknownRecord,
  path: string,
  errors: LanguageError[],
): AdlProperties | undefined {
  const properties = value.properties;
  if (properties === undefined) return undefined;
  if (!isRecord(properties)) {
    addError(errors, "INVALID_FIELD", "Properties must be an object.", `${path}.properties`);
    return undefined;
  }

  const result: Record<string, string> = {};
  for (const [key, property] of Object.entries(properties)) {
    if (typeof property !== "string") {
      addError(
        errors,
        "INVALID_PROPERTY",
        `Property "${key}" must have a string value.`,
        `${path}.properties.${key}`,
      );
    } else {
      result[key] = property;
    }
  }
  return result;
}

function readArray(
  value: UnknownRecord,
  key: string,
  path: string,
  errors: LanguageError[],
  required: boolean,
): readonly unknown[] {
  const field = value[key];
  if (field === undefined && !required) return [];
  if (!Array.isArray(field)) {
    addError(
      errors,
      field === undefined ? "MISSING_FIELD" : "INVALID_FIELD",
      `Field "${key}" must be an array.`,
      `${path}.${key}`,
    );
    return [];
  }
  return field;
}

function readElement(value: unknown, index: number, errors: LanguageError[]): AdlElement | undefined {
  const path = `$.elements[${index}]`;
  if (!isRecord(value)) {
    addError(errors, "INVALID_FIELD", "Element must be an object.", path);
    return undefined;
  }
  validateVisualState(value, path, errors);
  const id = readRequiredString(value, "id", path, errors);
  validateIdentifier(id, `${path}.id`, errors);
  const name = readRequiredString(value, "name", path, errors);
  const type = readRequiredString(value, "type", path, errors);
  const description = readOptionalString(value, "description", path, errors);
  const properties = readProperties(value, path, errors);
  if (id === undefined || name === undefined || type === undefined) return undefined;
  return {
    id,
    name,
    type,
    ...(description === undefined ? {} : { description }),
    ...(properties === undefined ? {} : { properties }),
  };
}

function readRelation(value: unknown, index: number, errors: LanguageError[]): AdlRelation | undefined {
  const path = `$.relations[${index}]`;
  if (!isRecord(value)) {
    addError(errors, "INVALID_FIELD", "Relation must be an object.", path);
    return undefined;
  }
  validateVisualState(value, path, errors);
  const id = readRequiredString(value, "id", path, errors);
  validateIdentifier(id, `${path}.id`, errors);
  const source = readRequiredString(value, "source", path, errors);
  const target = readRequiredString(value, "target", path, errors);
  const name = readOptionalString(value, "name", path, errors);
  const type = readOptionalString(value, "type", path, errors);
  const description = readOptionalString(value, "description", path, errors);
  const properties = readProperties(value, path, errors);
  if (id === undefined || source === undefined || target === undefined) return undefined;
  return {
    id,
    source,
    target,
    ...(name === undefined ? {} : { name }),
    ...(type === undefined ? {} : { type }),
    ...(description === undefined ? {} : { description }),
    ...(properties === undefined ? {} : { properties }),
  };
}

function readGroup(value: unknown, index: number, errors: LanguageError[]): AdlGroup | undefined {
  const path = `$.groups[${index}]`;
  if (!isRecord(value)) {
    addError(errors, "INVALID_FIELD", "Group must be an object.", path);
    return undefined;
  }
  validateVisualState(value, path, errors);
  const id = readRequiredString(value, "id", path, errors);
  validateIdentifier(id, `${path}.id`, errors);
  const name = readRequiredString(value, "name", path, errors);
  const elementIdsValue = readArray(value, "elementIds", path, errors, true);
  const elementIds: string[] = [];
  elementIdsValue.forEach((elementId, elementIndex) => {
    if (typeof elementId !== "string") {
      addError(
        errors,
        "INVALID_FIELD",
        "Group element reference must be a string.",
        `${path}.elementIds[${elementIndex}]`,
      );
    } else {
      elementIds.push(elementId);
    }
  });
  const description = readOptionalString(value, "description", path, errors);
  const properties = readProperties(value, path, errors);
  if (id === undefined || name === undefined) return undefined;
  return {
    id,
    name,
    elementIds,
    ...(description === undefined ? {} : { description }),
    ...(properties === undefined ? {} : { properties }),
  };
}

function validateUniqueIds(
  collections: readonly (readonly { readonly id: string }[])[],
  paths: readonly string[],
  errors: LanguageError[],
): void {
  const ids = new Set<string>();
  collections.forEach((collection, collectionIndex) => {
    collection.forEach((item, itemIndex) => {
      if (ids.has(item.id)) {
        addError(
          errors,
          "DUPLICATE_ID",
          `Identifier "${item.id}" is already declared.`,
          `$.${paths[collectionIndex]}[${itemIndex}].id`,
        );
      } else {
        ids.add(item.id);
      }
    });
  });
}

function validateReferences(
  elements: readonly AdlElement[],
  relations: readonly AdlRelation[],
  groups: readonly AdlGroup[],
  errors: LanguageError[],
): void {
  const elementIds = new Set(elements.map(({ id }) => id));
  relations.forEach((relation, index) => {
    for (const endpoint of ["source", "target"] as const) {
      if (!elementIds.has(relation[endpoint])) {
        addError(
          errors,
          "UNRESOLVED_REFERENCE",
          `Element "${relation[endpoint]}" is not declared.`,
          `$.relations[${index}].${endpoint}`,
        );
      }
    }
  });
  groups.forEach((group, groupIndex) => {
    group.elementIds.forEach((elementId, elementIndex) => {
      if (!elementIds.has(elementId)) {
        addError(
          errors,
          "UNRESOLVED_REFERENCE",
          `Element "${elementId}" is not declared.`,
          `$.groups[${groupIndex}].elementIds[${elementIndex}]`,
        );
      }
    });
  });
}

export function validateDocument(input: unknown): LanguageResult {
  if (!isRecord(input)) {
    return {
      ok: false,
      errors: [{ code: "INVALID_DOCUMENT", message: "Document must be an object.", path: "$" }],
    };
  }

  if (input.version !== LANGUAGE_VERSION) {
    return {
      ok: false,
      errors: [
        {
          code: "UNSUPPORTED_VERSION",
          message: `Unsupported ADL version "${String(input.version)}". Supported version: "${LANGUAGE_VERSION}".`,
          path: "$.version",
        },
      ],
    };
  }

  const errors: LanguageError[] = [];
  validateVisualState(input, "$", errors);
  const elements = readArray(input, "elements", "$", errors, true)
    .map((element, index) => readElement(element, index, errors))
    .filter((element): element is AdlElement => element !== undefined);
  const relations = readArray(input, "relations", "$", errors, false)
    .map((relation, index) => readRelation(relation, index, errors))
    .filter((relation): relation is AdlRelation => relation !== undefined);
  const groups = readArray(input, "groups", "$", errors, false)
    .map((group, index) => readGroup(group, index, errors))
    .filter((group): group is AdlGroup => group !== undefined);

  validateUniqueIds([elements, relations, groups], ["elements", "relations", "groups"], errors);
  validateReferences(elements, relations, groups, errors);

  if (errors.length > 0) return { ok: false, errors };
  const document: AdlDocument = { version: LANGUAGE_VERSION, elements, relations, groups };
  return { ok: true, document };
}
