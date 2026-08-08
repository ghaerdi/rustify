/**
 * Converts any value to its string representation.
 * Objects are serialized to JSON when their default string form would be `[object Object]`.
 * @param val The value to convert to a string.
 * @returns The string representation of `val`.
 * @internal
 */
export function toString(val: unknown): string {
  let value = String(val);
  if (value === '[object Object]') {
    try {
      value = JSON.stringify(val);
    } catch {
    }
  }
  return value;
}
