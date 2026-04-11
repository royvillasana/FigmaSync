import React from "react";

interface Props {
  prUrl: string;
  prNumber: number;
  branchName: string;
}

export function CompletadoState({ prUrl, prNumber, branchName }: Props) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ background: "#F0FDF4", border: "1px solid #86EFAC", borderRadius: 8, padding: 12 }}>
        <p style={{ fontWeight: 600, color: "#15803D", fontSize: 13 }}>Branch creada · PR abierta</p>
        <p style={{ fontSize: 11, color: "#166534", marginTop: 4 }}>{branchName}</p>
      </div>
      {prUrl && (
        <a
          href={prUrl}
          target="_blank"
          rel="noreferrer"
          style={{
            display: "block",
            textAlign: "center",
            background: "#6366F1",
            color: "#fff",
            borderRadius: 6,
            padding: "8px 0",
            textDecoration: "none",
            fontWeight: 600,
            fontSize: 12,
          }}
        >
          Ver PR #{prNumber} en GitHub →
        </a>
      )}
    </div>
  );
}
