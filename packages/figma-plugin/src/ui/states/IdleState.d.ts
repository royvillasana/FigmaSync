import React from "react";
interface Props {
    projectId: string;
    lastPR: {
        url: string;
        number: number;
        branch: string;
    } | null;
    onDisconnect: () => void;
}
export declare function IdleState({ projectId, lastPR, onDisconnect }: Props): React.JSX.Element;
export {};
//# sourceMappingURL=IdleState.d.ts.map