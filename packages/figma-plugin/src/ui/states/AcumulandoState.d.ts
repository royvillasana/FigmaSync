import React from "react";
interface Props {
    pendingCount: number;
    highCount: number;
    summary: Array<{
        name: string;
        significance: string;
        properties: string[];
    }>;
    inactivityMs: number;
    onSyncNow: () => void;
    onDiscard: () => void;
}
export declare function AcumulandoState({ pendingCount, highCount, summary, inactivityMs, onSyncNow, onDiscard }: Props): React.JSX.Element;
export {};
//# sourceMappingURL=AcumulandoState.d.ts.map