import { SyncStatusCard } from "@/components/sync/sync-status-card";

export default function OverviewPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Overview</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Figma ↔ GitHub sync status across all projects
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SyncStatusCard title="Active Syncs" value="0" status="synced" />
        <SyncStatusCard title="Pending Review" value="0" status="pending" />
        <SyncStatusCard title="Conflicts" value="0" status="conflict" />
      </div>
    </div>
  );
}
