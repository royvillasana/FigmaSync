import React from "react";

interface Props {
  pendingCount: number;
  highCount: number;
  summary: Array<{ name: string; significance: string; properties: string[] }>;
  inactivityMs: number;
  onSyncNow: () => void;
  onDiscard: () => void;
}

function formatMs(ms: number): string {
  const s = Math.ceil(ms / 1000);
  const m = Math.floor(s / 60);
  const remaining = s % 60;
  return m > 0 ? `${m}:${String(remaining).padStart(2, "0")}` : `${remaining}s`;
}

const SIGNIFICANCE_COLOR: Record<string, string> = {
  HIGH: "#EF4444",
  MEDIUM: "#F59E0B",
  LOW: "#6B7280",
};

export function AcumulandoState({ pendingCount, highCount, summary, inactivityMs, onSyncNow, onDiscard }: Props) {
  const threshold = 15;
  const progress = Math.min((highCount / threshold) * 100, 100);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontWeight: 600, fontSize: 13 }}>{pendingCount} cambios pendientes</span>
        {inactivityMs > 0 && (
          <span style={{ fontSize: 11, color: "#6B7280" }}>
            sync en {formatMs(inactivityMs)}
          </span>
        )}
      </div>

      {/* Progress bar */}
      <div style={{ background: "#E5E7EB", borderRadius: 4, height: 6 }}>
        <div
          style={{
            background: "#6366F1",
            borderRadius: 4,
            height: 6,
            width: `${progress}%`,
            transition: "width 0.3s",
          }}
        />
      </div>
      <p style={{ fontSize: 11, color: "#9CA3AF" }}>{highCount}/{threshold} cambios HIGH</p>

      {/* Change list */}
      <div style={{ maxHeight: 200, overflowY: "auto", display: "flex", flexDirection: "column", gap: 4 }}>
        {summary.map((item, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11 }}>
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: SIGNIFICANCE_COLOR[item.significance] ?? "#9CA3AF",
                flexShrink: 0,
              }}
            />
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
