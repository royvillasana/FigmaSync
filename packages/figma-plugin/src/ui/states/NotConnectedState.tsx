import React, { useState } from "react";

interface Props {
  onConnect: (projectId: string) => void;
}

export function NotConnectedState({ onConnect }: Props) {
  const [projectId, setProjectId] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleConnect() {
    const trimmed = projectId.trim();
    if (!trimmed) {
      setError("Please enter a project ID");
      return;
    }
    // Basic UUID format check
    if (!/^[0-9a-f-]{36}$/i.test(trimmed)) {
      setError("Invalid project ID — copy it from the UxBridge dashboard");
      return;
    }
    onConnect(trimmed);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#9CA3AF" }} />
        <span style={{ fontWeight: 600, fontSize: 13 }}>Not connected</span>
      </div>

      <p style={{ fontSize: 11, color: "#6B7280", lineHeight: 1.5 }}>
        Paste the Project ID from the UxBridge dashboard to link this Figma file.
      </p>

      <div>
        <label style={{ fontSize: 11, color: "#6B7280", display: "block", marginBottom: 4 }}>
          Project ID
        </label>
        <input
          type="text"
          value={projectId}
          onChange={(e) => { setProjectId(e.target.value); setError(null); }}
          placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
          style={{
            width: "100%",
            border: `1px solid ${error ? "#EF4444" : "#D1D5DB"}`,
            borderRadius: 6,
            padding: "6px 8px",
            fontSize: 11,
            fontFamily: "monospace",
            boxSizing: "border-box",
          }}
        />
        {error && (
          <p style={{ fontSize: 10, color: "#EF4444", marginTop: 4 }}>{error}</p>
        )}
      </div>

      <p style={{ fontSize: 10, color: "#9CA3AF", lineHeight: 1.5 }}>
        Find the ID on the project detail page in the dashboard at{" "}
        <span style={{ fontFamily: "monospace" }}>localhost:3000/projects</span>
      </p>

      <button
        onClick={handleConnect}
        disabled={!projectId.trim()}
        style={{
          background: "#6366F1",
          color: "#fff",
          border: "none",
          borderRadius: 6,
          padding: "8px 12px",
          cursor: projectId.trim() ? "pointer" : "not-allowed",
          fontWeight: 600,
          fontSize: 12,
          opacity: projectId.trim() ? 1 : 0.5,
        }}
      >
        Connect
      </button>
    </div>
  );
}
