type JsonPrimitive = string | number | boolean | null;
type JsonContainer = JsonValue[] | { [key: string]: JsonValue };
export type JsonValue = JsonPrimitive | JsonContainer;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function sortObject(value: unknown): JsonValue {
  if (Array.isArray(value)) {
    return value.map((entry) => sortObject(entry));
  }

  if (isRecord(value)) {
    const entries = Object.entries(value).sort(([a], [b]) => a.localeCompare(b));
    const sorted: Record<string, JsonValue> = {};
    for (const [key, child] of entries) {
      sorted[key] = sortObject(child);
    }
    return sorted;
  }

  if (value === null || typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return value;
  }

  throw new Error("Input contains non-JSON value.");
}

export function stableStringify(value: unknown, spaces = 2): string {
  const sorted = sortObject(value);
  return `${JSON.stringify(sorted, null, spaces)}\n`;
}
