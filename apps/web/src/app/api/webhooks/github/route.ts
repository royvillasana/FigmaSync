import { NextRequest, NextResponse } from "next/server";

// GitHub webhooks are handled by apps/api directly.
// This route exists as a fallback redirect for deployments where
// both web and api are under the same domain.
export async function POST(request: NextRequest) {
  const apiUrl = process.env["API_URL"] ?? "http://localhost:3001";
  const body = await request.text();

  const response = await fetch(`${apiUrl}/api/webhooks/github`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-hub-signature-256": request.headers.get("x-hub-signature-256") ?? "",
      "x-github-event": request.headers.get("x-github-event") ?? "",
    },
    body,
  });

  const data = await response.json() as unknown;
  return NextResponse.json(data, { status: response.status });
}
