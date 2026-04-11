/**
 * Code Generator
 * Uses OpenRouter (Claude 3.5 Sonnet) to generate React TSX from Figma node context.
 */

import { ai, resolveModel } from "../config/openrouter.js";
import type { FigmaNodeContext } from "./figma-context.js";

export interface GeneratedFile {
  path: string;
  content: string;
  nodeId: string;
  modelUsed: string;
}

const SYSTEM_PROMPT = `You are an expert React/TypeScript developer converting Figma designs to code.
Generate a clean, production-ready React component in TypeScript.

Rules:
- Use TypeScript with explicit prop types
- Use Tailwind CSS for styling
- Export as a named export
- Include a default props example at the bottom as a comment
- Keep it focused — one component per file
- No imports from unknown libraries — only react and standard HTML
- If you see variants, use a union type prop
- Return ONLY the TSX code, no markdown fences, no explanation`;

export async function generateComponentCode(
  context: FigmaNodeContext,
  workspaceModel?: string | null,
): Promise<GeneratedFile> {
  const model = resolveModel("code_generation", workspaceModel);

  const userPrompt = buildPrompt(context);

  const response = await ai.chat.completions.create({
    model,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.2,
    max_tokens: 2048,
  });

  const code = response.choices[0]?.message?.content?.trim() ?? "";
  const componentName = toComponentName(context.nodeName);
  const filePath = `src/components/ui/${toFileName(context.nodeName)}.tsx`;

  return {
    path: filePath,
    content: code || buildFallbackStub(componentName, context),
    nodeId: context.nodeId,
    modelUsed: model,
  };
}

export async function generateTokensFile(
  changedTokens: Array<{ name: string; value: unknown }>,
  workspaceModel?: string | null,
): Promise<GeneratedFile> {
  const model = resolveModel("token_diff", workspaceModel);

  const response = await ai.chat.completions.create({
    model,
    messages: [
      {
        role: "system",
        content: "Convert the following Figma design tokens to a W3C DTCG-compatible tokens.json file. Return only valid JSON, no explanation.",
      },
      {
        role: "user",
        content: JSON.stringify(changedTokens, null, 2),
      },
    ],
    temperature: 0,
    max_tokens: 2048,
  });

  const content = response.choices[0]?.message?.content?.trim() ?? "{}";

  return {
    path: "tokens/tokens.json",
    content,
    nodeId: "tokens",
    modelUsed: model,
  };
}

function buildPrompt(context: FigmaNodeContext): string {
  const lines: string[] = [
    `Component name: ${context.nodeName}`,
    `Node type: ${context.nodeType}`,
  ];

  if (context.description) {
    lines.push(`Description: ${context.description}`);
  }

  if (context.rawNode && Object.keys(context.rawNode).length > 0) {
    const relevant = extractRelevantProps(context.rawNode);
    lines.push(`\nFigma node properties:\n${JSON.stringify(relevant, null, 2)}`);
  }

  lines.push("\nGenerate a React TypeScript component for this Figma node.");
  return lines.join("\n");
}

function extractRelevantProps(node: Record<string, unknown>): Record<string, unknown> {
  const KEEP = ["type", "name", "fills", "strokes", "effects", "style", "layoutMode",
    "primaryAxisAlignItems", "counterAxisAlignItems", "paddingTop", "paddingBottom",
    "paddingLeft", "paddingRight", "itemSpacing", "cornerRadius", "opacity",
    "characters", "componentPropertyDefinitions"];
  return Object.fromEntries(
    Object.entries(node).filter(([k]) => KEEP.includes(k))
  );
}

function buildFallbackStub(componentName: string, context: FigmaNodeContext): string {
  return `import React from "react";

interface ${componentName}Props {
  className?: string;
}

export function ${componentName}({ className }: ${componentName}Props) {
  return (
    <div className={className}>
      {/* TODO: implement ${context.nodeName} (node: ${context.nodeId}) */}
    </div>
  );
}

// Example: <${componentName} />
`;
}

function toComponentName(name: string): string {
  return name
    .split(/[\s\-_\/]+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join("");
}

function toFileName(name: string): string {
  return name.toLowerCase().replace(/[\s\/]+/g, "-").replace(/[^a-z0-9\-]/g, "");
}
