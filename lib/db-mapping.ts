/**
 * The database uses snake_case columns (image_media_id), the app uses
 * camelCase fields (imageMediaId). These two helpers convert top-level
 * keys between the two, so each table maps 1:1 to its TypeScript type
 * without a hand-written mapper per table.
 */

const toSnake = (key: string) => key.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);
const toCamel = (key: string) => key.replace(/_([a-z0-9])/g, (_, c: string) => c.toUpperCase());

/** App object -> database row. `undefined` becomes `null` (clears the column). */
export function toRow(obj: object): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [toSnake(k), v === undefined ? null : v])
  );
}

/** Database row -> app object. `null` columns are left out (become `undefined`). */
export function fromRow<T>(row: Record<string, unknown>): T {
  return Object.fromEntries(
    Object.entries(row)
      .filter(([, v]) => v !== null)
      .map(([k, v]) => [toCamel(k), v])
  ) as T;
}
