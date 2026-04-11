import React from "react";
interface Props {
    pendingCount: number;
    summary: Array<{
        name: string;
        significance: string;
        properties: string[];
    }>;
    onSyncNow: () => void;
    onDiscard: () => void;
}
export declare function ListoState({ pendingCount, summary, onSyncNow, onDiscard }: Props): React.JSX.Element;
export {};
//# sourceMappingURL=ListoState.d.ts.map