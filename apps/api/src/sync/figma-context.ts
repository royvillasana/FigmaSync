/**
 * Figma Context Fetcher
 * Uses the Figma REST API to get node details for changed components.
 */

import { env } from "../config/env.js";

export interface FigmaNodeContext {
  nodeId: string;
  nodeName: string;
  nodeType: string;
  description: string;
  imageUrl: string | null;
  rawNode: Record<string, unknown>;
}

const FIGMA_API = "https://api.figma.com/v1";

async function figmaGet<T>(path: string): Promise<T> {
  const res = await fetch(`${FIGMA_API}${path}`, {
    headers: { "X-Figma-Token": env.FIGMA_ACCESS_TOKEN },
  });
  if (!res.ok) {
    throw new Error(`Figma API error ${res.status}: ${await res.text()}`);
  }
  return res.json() as Promise<T>;
}

/** Fetch node details + a PNG render for a list of node IDs */
export async function getFigmaNodeContexts(
  fileKey: string,
  nodeIds: string[],
): Promise<FigmaNodeContext[]> {
  if (nodeIds.length === 0) return [];

  const ids = nodeIds.join(",");

  // Fetch node data and images in parallel
  const [nodesResponse, imagesResponse] = await Promise.all([
    figmaGet<{ nodes: Record<string, { document: Record<string, unknown> }> }>(
      `/files/${fileKey}/nodes?ids=${encodeURIComponent(ids)}`,
    ),
    figmaGet<{ images: Record<string, string | null> }>(
      `/images/${fileKey}?ids=${encodeURIComponent(ids)}&format=png&scale=2`,
    ).catch(() => ({ images: {} as Record<string, string | null> })),
  ]);

  return nodeIds.map((nodeId) => {
    const normalizedId = nodeId.replace(/-/g, ":");
    const node = nodesResponse.nodes[normalizedId]?.document ?? nodesResponse.nodes[nodeId]?.document ?? {};
    const imageUrl = imagesResponse.images[normalizedId] ?? imagesResponse.images[nodeId] ?? null;

    return {
      nodeId,
      nodeName: (node["name"] as string) ?? "Unknown",
      nodeType: (node["type"] as string) ?? "FRAME",
      description: (node["description"] as string) ?? "",
      imageUrl,
      rawNode: node,
    };
  });
}
