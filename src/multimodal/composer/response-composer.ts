export function composeResponse(parts: Array<string | Record<string, unknown>>): string {
  return parts.map((p) => (typeof p === "string" ? p : JSON.stringify(p))).join("\n");
}
