"use client";

export function TokenDiffViewer() {
  return (
    <div className="border rounded-lg p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-sm">Token Pipeline</h2>
        <span className="text-xs text-muted-foreground">W3C DTCG · tokens.json</span>
      </div>
      <div className="grid grid-cols-2 gap-4 text-xs">
        <div className="space-y-1">
          <p className="font-medium text-muted-foreground uppercase tracking-wide">Outputs</p>
          <ul className="space-y-1 font-mono">
            <li className="text-green-600">tokens/css/variables.css</li>
            <li className="text-green-600">tokens/tailwind/config.ts</li>
            <li className="text-green-600">tokens/js/tokens.ts</li>
            <li className="text-green-600">tokens/scss/variables.scss</li>
            <li className="text-green-600">tokens/json/flat.json</li>
          </ul>
        </div>
        <div className="space-y-1">
          <p className="font-medium text-muted-foreground uppercase tracking-wide">Last Sync</p>
          <p className="text-muted-foreground">No syncs yet</p>
        </div>
      </div>
    </div>
  );
}
