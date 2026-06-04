/**
 * Truncates a long ID string and appends ellipsis.
 * Useful for displaying backend-generated UUIDs or long IDs in table cells.
 *
 * @param id - The ID string to truncate
 * @param maxLength - Maximum characters to show before ellipsis (default: 8)
 * @returns Truncated ID with "..." suffix, or original if short enough
 */
export function truncateId(id: string | undefined | null, maxLength: number = 8): string {
  if (!id) return "—";
  if (id.length <= maxLength) return id;
  return `${id.slice(0, maxLength)}...`;
}
