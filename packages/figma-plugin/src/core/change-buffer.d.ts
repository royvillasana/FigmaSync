/**
 * Change Buffer
 * Map<nodeId, PendingChange> — deduplicates edits to the same node.
 * 40 edits to the same node = 1 PendingChange (state after last edit).
 */
import type { BatchConfig, PendingChange } from "@uxbridge/types";
export declare class ChangeBuffer {
    private buffer;
    private config;
    constructor(config?: Partial<BatchConfig>);
    /**
     * Add or merge a change into the buffer.
     * If the node already has a pending change, merges changedProperties
     * and updates lastSeenAt.
     */
    add(change: Omit<PendingChange, "firstSeenAt" | "lastSeenAt">): void;
    /** Flush: return all pending changes and clear the buffer */
    flush(): PendingChange[];
    /** Count changes by significance */
    countBySignificance(significance: PendingChange["significance"]): number;
    /** Total changes in buffer */
    get size(): number;
    /** Is the buffer empty? */
    get isEmpty(): boolean;
    /** Age of oldest change in buffer (ms) */
    get oldestChangeAge(): number;
    /** Get a summary list for the UI */
    getSummary(): Array<{
        name: string;
        significance: PendingChange["significance"];
        properties: string[];
    }>;
    private significanceRank;
    private changeTypeRank;
}
//# sourceMappingURL=change-buffer.d.ts.map