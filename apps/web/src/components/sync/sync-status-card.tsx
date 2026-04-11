import { cn } from "@/lib/utils";

interface Props {
  title: string;
  value: string;
  status: "synced" | "pending" | "conflict" | "error";
}

const STATUS_COLORS = {
  synced: "bg-green-50 border-green-200 text-green-700",
  pending: "bg-yellow-50 border-yellow-200 text-yellow-700",
  conflict: "bg-red-50 border-red-200 text-red-700",
  error: "bg-red-50 border-red-200 text-red-700",
};

export function SyncStatusCard({ title, value, status }: Props) {
  return (
    <div className={cn("border rounded-lg p-4", STATUS_COLORS[status])}>
      <p className="text-sm font-medium opacity-80">{title}</p>
      <p className="text-3xl font-bold mt-1">{value}</p>
    </div>
  );
}
