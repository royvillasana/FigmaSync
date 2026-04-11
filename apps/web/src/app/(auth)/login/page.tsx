"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function LoginPage() {
  const supabase = createClientComponentClient();

  const handleGitHubLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "github",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-sm space-y-6 p-8 border rounded-lg shadow-sm">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">UxBridge</h1>
          <p className="text-muted-foreground text-sm">
            Bidirectional Figma ↔ GitHub sync
          </p>
        </div>
        <button
          onClick={handleGitHubLogin}
          className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-md px-4 py-2 font-medium hover:opacity-90 transition-opacity"
        >
          Continue with GitHub
        </button>
      </div>
    </div>
  );
}
