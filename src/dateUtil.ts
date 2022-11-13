/**
 * Transform a `Date` object into a String suitable for showing users.
 */
export function dateAsString(stamp: Date): string {
  return stamp.toLocaleDateString("en-US", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}
