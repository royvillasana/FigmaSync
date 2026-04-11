/**
 * DTCG Extractor
 * Converts Figma's native variable format (from get_variable_defs MCP tool)
 * into the W3C Design Token Community Group (DTCG) format.
 *
 * This is the first step of the token pipeline (Figma → GitHub direction).
 * Code Connect is NOT used for tokens — this is the own pipeline.
 */

import type {
  DTCGToken,
  DTCGTokenGroup,
  ExtractedTokens,
  FigmaVariable,
  TokensJson,
} from "@uxbridge/types";

/** Convert a Figma COLOR value {r,g,b,a} to hex string */
function figmaColorToHex(color: { r: number; g: number; b: number; a?: number }): string {
  const toHex = (n: number) =>
    Math.round(n * 255)
      .toString(16)
      .padStart(2, "0");
  const hex = `#${toHex(color.r)}${toHex(color.g)}${toHex(color.b)}`;
  if (color.a !== undefined && color.a < 1) {
    return `${hex}${toHex(color.a)}`;
  }
  return hex;
}

/** Convert Figma variable name (e.g. "color/primary/500") to DTCG path segments */
function nameToDtcgPath(name: string): string[] {
  return name
    .replace(/\s+/g, "-")
    .toLowerCase()
    .split("/")
    .filter(Boolean);
}

/** Set a nested value in a token group using a path array */
function setNestedToken(
  root: DTCGTokenGroup,
  path: string[],
  token: DTCGToken,
): void {
  let current = root;
  for (let i = 0; i < path.length - 1; i++) {
    const key = path[i]!;
    if (!current[key] || typeof (current[key] as DTCGToken).$value !== "undefined") {
      current[key] = {} as DTCGTokenGroup;
    }
    current = current[key] as DTCGTokenGroup;
  }
  const lastKey = path[path.length - 1]!;
  current[lastKey] = token;
}

/**
 * Extract tokens from Figma variables (output of get_variable_defs)
 * and convert to W3C DTCG format.
 *
 * @param variables - Raw Figma variables from the MCP tool
 * @param preferMode - Which mode to use as primary value (default: first mode found)
 */
export function extractDTCGTokens(
  variables: FigmaVariable[],
  preferMode?: string,
): ExtractedTokens {
  const tokens: TokensJson = {};
  const variableIdToDtcgPath: Record<string, string> = {};

  for (const variable of variables) {
    const path = nameToDtcgPath(variable.name);
    const dtcgPath = path.join(".");

    // Resolve value: prefer the specified mode, fall back to first available
    const modeKeys = Object.keys(variable.valuesByMode);
    const modeKey = preferMode
      ? (modeKeys.find((k) => k === preferMode) ?? modeKeys[0])
      : modeKeys[0];

    if (!modeKey) continue;

    const rawValue = variable.valuesByMode[modeKey];

    let token: DTCGToken;

    switch (variable.type) {
      case "COLOR": {
        const color = rawValue as { r: number; g: number; b: number; a?: number };
        token = {
          $value: figmaColorToHex(color),
          $type: "color",
          $description: variable.name,
        };
        break;
      }
      case "FLOAT": {
        const num = rawValue as number;
        token = {
          $value: Number.isInteger(num) ? `${num}px` : num,
          $type: "dimension",
        };
        break;
      }
      case "STRING": {
        token = {
          $value: String(rawValue),
          $type: "string",
        };
        break;
      }
      case "BOOLEAN": {
        token = {
          $value: Boolean(rawValue),
          $type: "boolean",
        };
        break;
      }
      default:
        continue;
    }

    setNestedToken(tokens, path, token);
    variableIdToDtcgPath[variable.id] = dtcgPath;
  }

  return { tokens, variableIdToDtcgPath };
}

/**
 * Compute a diff between two tokens.json snapshots.
 * Returns only the tokens that changed (added, removed, or value changed).
 */
export function diffTokens(
  previous: TokensJson,
  current: TokensJson,
  pathPrefix = "",
): Array<{ path: string; previous: unknown; current: unknown; action: "added" | "removed" | "changed" }> {
  const diffs: Array<{
    path: string;
    previous: unknown;
    current: unknown;
    action: "added" | "removed" | "changed";
  }> = [];

  const allKeys = new Set([...Object.keys(previous), ...Object.keys(current)]);

  for (const key of allKeys) {
    const fullPath = pathPrefix ? `${pathPrefix}.${key}` : key;
    const prev = previous[key];
    const curr = current[key];

    if (prev === undefined) {
      diffs.push({ path: fullPath, previous: undefined, current: curr, action: "added" });
    } else if (curr === undefined) {
      diffs.push({ path: fullPath, previous: prev, current: undefined, action: "removed" });
    } else if (
      typeof (prev as DTCGToken).$value !== "undefined" &&
      typeof (curr as DTCGToken).$value !== "undefined"
    ) {
      const prevVal = (prev as DTCGToken).$value;
      const currVal = (curr as DTCGToken).$value;
      if (JSON.stringify(prevVal) !== JSON.stringify(currVal)) {
        diffs.push({ path: fullPath, previous: prevVal, current: currVal, action: "changed" });
      }
    } else {
      // Recurse into groups
      const subDiffs = diffTokens(
        prev as DTCGTokenGroup,
        curr as DTCGTokenGroup,
        fullPath,
      );
      diffs.push(...subDiffs);
    }
  }

  return diffs;
}
