/**
 * Server-side change buffer — used to reconstruct state from WS payload.
 * The canonical buffer lives in the plugin; this is the server's view after flush.
 */

import type { PendingChange } from "@uxbridge/types";

/** Deduplicate an array of PendingChanges by nodeId (last write wins) */
export function deduplicateChanges(changes: PendingChange[]): PendingChange[] {
  const map = new Map<string, PendingChange>();
  for (const change of changes) {
    const existing = map.get(change.nodeId);
    if (existing) {
      existing.changedProperties = [
        ...new Set([...existing.changedProperties, ...change.changedProperties]),
      ];
      existing.lastSeenAt = change.lastSeenAt;
    } else {
      map.set(change.nodeId, { ...change });
    }
  }
  return Array.from(map.values());
}

/** Filter to only HIGH and MEDIUM changes (skip LOW for API calls) */
export function filterSignificantChanges(changes: PendingChange[]): PendingChange[] {
  return changes.filter((c) => c.significance === "HIGH" || c.significance === "MEDIUM");
}
