"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

type Via = "A" | "B" | "C" | "D";

const VIAS: Array<{ id: Via; title: string; description: string; when: string; effort: string }> = [
  {
    id: "A",
    title: "Predefined Design System",
    description: "shadcn/ui, MUI, Ant Design, or Radix with official Figma kits.",
    when: "New project, no existing DS",
    effort: "Low",
  },
  {
    id: "B",
    title: "Existing Figma Library",
    description: "Your team already has an active Figma component library.",
    when: "Active Figma library",
    effort: "Medium",
  },
  {
    id: "C",
    title: "Code-first (Storybook / Tokens)",
    description: "Components exist in code. We'll create Figma from your stories.",
    when: "Dev-first: code exists before design",
    effort: "Medium",
  },
  {
    id: "D",
    title: "From scratch with AI",
    description: "AI analyzes your Figma frames and componentizes everything.",
    when: "Flat design, no components yet",
    effort: "High",
  },
];

export function OnboardingWizard() {
  const router = useRouter();
  const [selectedVia, setSelectedVia] = useState<Via | null>(null);
  const [step, setStep] = useState<"pick-via" | "configure">("pick-via");
  const [figmaUrl, setFigmaUrl] = useState("");
  const [githubRepo, setGithubRepo] = useState("");
  const [syncBranch, setSyncBranch] = useState("main");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("http://localhost:3001/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          figma_file_url: figmaUrl,
          github_repo: githubRepo,
          sync_on_merge_to: syncBranch,
          via: selectedVia,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to create project");
      router.push(`/projects/${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      {step === "pick-via" && (
        <>
          <p className="text-sm font-medium">Choose your Design System path:</p>
          <div className="grid grid-cols-1 gap-3">
            {VIAS.map((via) => (
              <button
                key={via.id}
                onClick={() => setSelectedVia(via.id)}
                className={cn(
                  "text-left border rounded-lg p-4 transition-all hover:border-primary",
                  selectedVia === via.id
                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                    : "border-border",
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm">
                    Via {via.id} — {via.title}
                  </span>
                  <span className={cn(
                    "text-xs px-2 py-0.5 rounded-full",
                    via.effort === "Low" ? "bg-green-100 text-green-700" :
                    via.effort === "Medium" ? "bg-yellow-100 text-yellow-700" :
                    "bg-red-100 text-red-700",
                  )}>
                    {via.effort} effort
                  </span>
                </div>
                <p className="text-muted-foreground text-sm mt-1">{via.description}</p>
                <p className="text-xs text-muted-foreground mt-1">When: {via.when}</p>
              </button>
            ))}
          </div>
          <button
            disabled={!selectedVia}
            onClick={() => setStep("configure")}
            className="w-full bg-primary text-primary-foreground rounded-md px-4 py-2 text-sm font-medium disabled:opacity-50 hover:opacity-90 transition-opacity"
          >
            Continue with Via {selectedVia ?? "…"}
          </button>
        </>
      )}

      {step === "configure" && (
        <div className="space-y-4">
          <p className="text-sm font-medium">Configure project settings</p>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">
                Figma File URL
              </label>
              <input
                type="text"
                placeholder="https://www.figma.com/file/..."
                value={figmaUrl}
                onChange={(e) => setFigmaUrl(e.target.value)}
                className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">
                GitHub Repository (owner/repo)
              </label>
              <input
                type="text"
                placeholder="acme/design-system"
                value={githubRepo}
                onChange={(e) => setGithubRepo(e.target.value)}
                className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">
                Sync branch (merges here trigger Figma updates)
              </label>
              <input
                type="text"
                value={syncBranch}
                onChange={(e) => setSyncBranch(e.target.value)}
                className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}
          <div className="flex gap-3">
            <button
              onClick={() => setStep("pick-via")}
              disabled={loading}
              className="flex-1 border rounded-md px-4 py-2 text-sm hover:bg-muted/50 transition-colors disabled:opacity-50"
            >
              Back
            </button>
            <button
              onClick={handleCreate}
              disabled={loading || !figmaUrl || !githubRepo || !syncBranch}
              className="flex-1 bg-primary text-primary-foreground rounded-md px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? "Creating…" : "Create Project"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
