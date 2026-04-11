import React from "react";

export function SincronizandoState() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "center", paddingTop: 24 }}>
      <div
        style={{
          width: 32,
          height: 32,
          border: "3px solid #E5E7EB",
          borderTopColor: "#6366F1",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
        }}
      />
      <p style={{ fontSize: 12, color: "#374151", fontWeight: 500 }}>Creando rama en GitHub...</p>
      <p style={{ fontSize: 11, color: "#9CA3AF" }}>No cierres el plugin</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
