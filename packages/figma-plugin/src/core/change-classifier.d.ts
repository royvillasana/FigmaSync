/**
 * Change Classifier
 * Determines the significance of a Figma documentChange event.
 *
 * HIGH   — variables, DS component create/delete, visual properties on DS page
 * MEDIUM — auto-layout, new variants
 * LOW    — rename, free text
 * IGNORE — canvas moves, zoom/pan, layer reorder outside DS
 */
import type { ChangeSignificance, ChangeType } from "@uxbridge/types";
export interface ClassifiedChange {
    significance: ChangeSignificance;
    changeType: ChangeType;
    isInDSPage: boolean;
}
/**
 * Classify a single documentChange entry.
 * @param change - A single entry from the Figma documentChange event
 * @param currentPageName - Name of the currently active page
 */
export declare function classifyChange(change: {
    type: string;
    node: {
        type: string;
        name: string;
        parent?: {
            name: string;
        };
    };
    properties?: string[];
}, currentPageName: string): ClassifiedChange;
//# sourceMappingURL=change-classifier.d.ts.map