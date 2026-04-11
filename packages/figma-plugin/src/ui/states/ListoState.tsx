import React from "react";

interface Props {
  pendingCount: number;
  summary: Array<{ name: string; significance: string; properties: string[] }>;
  onSyncNow: () => void;
  onDiscard: () => void;
}

export function ListoState({ pendingCount, summary, onSyncNow, onDiscard }: Props) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ background: "#EEF2FF", borderRadius: 8, padding: 12 }}>
        <p style={{ fontWeight: 600, color: "#4338CA", fontSize: 13 }}>
          {pendingCount} cambios listos para sync
        </p>
      </div>

      <div style={{ maxHeight: 220, overflowY: "auto", display: "flex", flexDirection: "column", gap: 4 }}>
        {summary.map((item, i) => (
          <div key={i} style={{ fontSize: 11, display: "flex", gap: 6 }}>
            <span style={{ fontWeight: 500 }}>{item.name}</span>
            <span style={{ color: "#9CA3AF" }}>{item.properties.slice(0, 3).join(", ")}</span>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={onSyncNow}
          style={{
            flex: 1,
            background: "#6366F1",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            padding: "8px 0",
            cursor: "pointer",
            fontWeight: 600,
            fontSize: 12,
          }}
        >
          Sync ahora
        </button>
        <button
          onClick={onDiscard}
          style={{
            flex: 1,
            background: "#F3F4F6",
            color: "#374151",
            border: "none",
            borderRadius: 6,
            padding: "8px 0",
            cursor: "pointer",
            fontSize: 12,
          }}
        >
          Descartar
        </button>
      </div>
    </div>
  );
}
