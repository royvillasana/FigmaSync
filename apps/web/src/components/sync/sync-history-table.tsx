"use client";

import { useEffect, useState } from "react";
import type { SyncEvent } from "@uxbridge/types";

interface Props {
  projectId: string;
}

export function SyncHistoryTable({ projectId }: Props) {
  const [events, setEvents] = useState<SyncEvent[]>([]);

  useEffect(() => {
    const apiUrl = process.env["NEXT_PUBLIC_API_URL"] ?? "http://localhost:3001";
    fetch(`${apiUrl}/api/projects/${projectId}/sync-history`)
      .then((r) => r.json())
      .then((data) => setEvents(data as SyncEvent[]))
      .catch(console.error);
  }, [projectId]);

  if (events.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">No sync events yet.</p>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-muted/50">
          <tr>
            <th className="text-left px-4 py-3 font-medium">Direction</th>
            <th className="text-left px-4 py-3 font-medium">Trigger</th>
            <th className="text-left px-4 py-3 font-medium">Status</th>
            <th className="text-left px-4 py-3 font-medium">PR</th>
            <th className="text-left px-4 py-3 font-medium">Date</th>
          </tr>
        </thead>
        <tbody>
          {events.map((event) => (
            <tr key={event.id} className="border-t hover:bg-muted/20">
              <td className="px-4 py-3 font-mono text-xs">{event.direction}</td>
              <td className="px-4 py-3">{event.trigger}</td>
              <td className="px-4 py-3">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                  event.status === "success" ? "bg-green-100 text-green-700" :
                  event.status === "error" ? "bg-red-100 text-red-700" :
                  "bg-yellow-100 text-yellow-700"
                }`}>
                  {event.status}
                </span>
              </td>
              <td className="px-4 py-3">
                {event.pr_number ? `#${event.pr_number}` : "—"}
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {new Date(event.created_at).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
