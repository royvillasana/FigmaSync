/**
 * Change Classifier
 * Determines the significance of a Figma documentChange event.
 *
 * HIGH   — variables, DS component create/delete, visual properties on DS page
 * MEDIUM — auto-layout, new variants
 * LOW    — rename, free text
 * IGNORE — canvas moves, zoom/pan, layer reorder outside DS
 */

import type { ChangeSignificance, ChangeType } from "@uxbridge/types";

const DS_PAGE_NAME = "Design System";

/** Properties that count as HIGH significance on a DS node */
const HIGH_VISUAL_PROPERTIES = new Set([
  "fills",
  "strokes",
  "effects",
  "typography",
  "cornerRadius",
  "padding",
  "spacing",
  "itemSpacing",
  "paddingTop",
  "paddingBottom",
  "paddingLeft",
  "paddingRight",
  "strokeWeight",
  "opacity",
]);

/** Properties that count as MEDIUM significance */
const MEDIUM_PROPERTIES = new Set([
  "layoutMode",
  "primaryAxisAlignItems",
  "counterAxisAlignItems",
  "layoutWrap",
  "constraints",
  "clipsContent",
  "layoutGrow",
  "layoutAlign",
]);

export interface ClassifiedChange {
  significance: ChangeSignificance;
  changeType: ChangeType;
  isInDSPage: boolean;
}

/**
 * Classify a single documentChange entry.
 * @param change - A single entry from the Figma documentChange event
 * @param currentPageName - Name of the currently active page
 */
export function classifyChange(
  change: { type: string; node: { type: string; name: string; parent?: { name: string } }; properties?: string[] },
  currentPageName: string,
): ClassifiedChange {
  const isInDSPage =
    currentPageName === DS_PAGE_NAME ||
    change.node.parent?.name === DS_PAGE_NAME;

  // Determine change type
  let changeType: ChangeType = "PROPERTY_CHANGE";
  if (change.type === "CREATE") changeType = "CREATE";
  else if (change.type === "DELETE") changeType = "DELETE";

  // IGNORE: canvas-level moves and view changes
  if (
    change.type === "MOVE" ||
    change.type === "SELECTION_CHANGE" ||
    change.type === "VIEWPORT_CHANGE" ||
    change.type === "SCROLL"
  ) {
    return { significance: "IGNORE", changeType, isInDSPage };
  }

  // Variable / token changes are always HIGH
  if (
    change.node.type === "VARIABLE" ||
    change.node.type === "VARIABLE_COLLECTION" ||
    change.node.type === "VARIABLE_ALIAS"
  ) {
    return { significance: "HIGH", changeType, isInDSPage };
  }

  // Component / component set creation or deletion — HIGH everywhere
  if (
    (change.node.type === "COMPONENT" || change.node.type === "COMPONENT_SET") &&
    (changeType === "CREATE" || changeType === "DELETE")
  ) {
    return { significance: "HIGH", changeType, isInDSPage };
  }

  // Visual property changes on DS nodes are HIGH; on other nodes MEDIUM
  if (change.properties) {
    const hasHighProp = change.properties.some((p) => HIGH_VISUAL_PROPERTIES.has(p));
    if (hasHighProp) {
      return { significance: isInDSPage ? "HIGH" : "MEDIUM", changeType, isInDSPage };
    }
  }

  // Layout / auto-layout changes are MEDIUM
  if (change.properties) {
    const hasMediumProp = change.properties.some((p) => MEDIUM_PROPERTIES.has(p));
    if (hasMediumProp) {
      return { significance: "MEDIUM", changeType, isInDSPage };
    }
  }

  // Renames are LOW
  if (change.properties?.includes("name")) {
    return { significance: "LOW", changeType, isInDSPage };
  }

  // Text content changes are LOW
  if (change.node.type === "TEXT") {
    return { significance: "LOW", changeType, isInDSPage };
  }

  // Any CREATE or DELETE on a meaningful node type is at least MEDIUM
  if (changeType === "CREATE" || changeType === "DELETE") {
    const meaningfulTypes = new Set(["FRAME", "GROUP", "INSTANCE", "VECTOR", "RECTANGLE", "ELLIPSE", "POLYGON", "STAR", "LINE"]);
    if (meaningfulTypes.has(change.node.type)) {
      return { significance: "MEDIUM", changeType, isInDSPage };
    }
  }

  // Any property change on a FRAME or INSTANCE is at least LOW
  if (change.properties && change.properties.length > 0) {
    if (change.node.type === "FRAME" || change.node.type === "INSTANCE" || change.node.type === "GROUP") {
      return { significance: "LOW", changeType, isInDSPage };
    }
  }

  // Default: IGNORE anything not explicitly categorized
  return { significance: "IGNORE", changeType, isInDSPage };
}
