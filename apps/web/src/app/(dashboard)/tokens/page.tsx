import { TokenDiffViewer } from "@/components/tokens/token-diff-viewer";

export default function TokensPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Design Tokens</h1>
        <p className="text-muted-foreground text-sm mt-1">
          W3C DTCG token pipeline · tokens.json ↔ Figma Variables
        </p>
      </div>
      <TokenDiffViewer />
    </div>
  );
}
