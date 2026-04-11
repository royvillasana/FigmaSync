import React from "react";

interface Props {
  message: string;
  onRetry: () => void;
}

export function ErrorState({ message, onRetry }: Props) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ background: "#FFF1F2", border: "1px solid #FECDD3", borderRadius: 8, padding: 12 }}>
        <p style={{ fontWeight: 600, color: "#BE123C", fontSize: 13 }}>Sync falló</p>
        <p style={{ fontSize: 11, color: "#9F1239", marginTop: 4, wordBreak: "break-word" }}>
          {message}
        </p>
      </div>
      <p style={{ fontSize: 11, color: "#6B7280" }}>
        Los cambios permanecen en el buffer — puedes reintentar.
      </p>
      <button
        onClick={onRetry}
        style={{
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
        Reintentar
      </button>
    </div>
  );
}
