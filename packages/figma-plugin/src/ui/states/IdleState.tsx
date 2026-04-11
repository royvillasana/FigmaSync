import React from "react";

interface Props {
  projectId: string;
  lastPR: { url: string; number: number; branch: string } | null;
  onDisconnect: () => void;
}

export function IdleState({ projectId, lastPR, onDisconnect }: Props) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#22C55E" }} />
          <span style={{ fontWeight: 600, fontSize: 13 }}>Connected</span>
        </div>
        <button
          onClick={onDisconnect}
          style={{
            background: "none",
            border: "none",
            fontSize: 11,
            color: "#9CA3AF",
            cursor: "pointer",
            padding: "2px 4px",
          }}
        >
          Disconnect
        </button>
      </div>

      <p style={{ fontSize: 11, color: "#6B7280" }}>
        Sin cambios pendientes. Edita un componente para comenzar.
      </p>

      {lastPR && (
        <div style={{ background: "#F3F4F6", borderRadius: 6, padding: "8px 10px" }}>
          <p style={{ fontSize: 10, color: "#6B7280", marginBottom: 2 }}>Último sync</p>
          <a
            href={lastPR.url}
            target="_blank"
            rel="noreferrer"
            style={{ fontSize: 11, color: "#6366F1", fontWeight: 500 }}
          >
            PR #{lastPR.number} · {lastPR.branch}
          </a>
        </div>
      )}

      <p style={{ fontSize: 10, color: "#D1D5DB", fontFamily: "monospace", wordBreak: "break-all" }}>
        {projectId}
      </p>
    </div>
  );
}
