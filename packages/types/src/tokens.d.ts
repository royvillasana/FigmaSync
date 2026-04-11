export type DTCGTokenType = "color" | "dimension" | "fontFamily" | "fontWeight" | "duration" | "cubicBezier" | "number" | "typography" | "border" | "shadow" | "gradient" | "string" | "boolean";
/** A leaf token in the W3C DTCG format */
export interface DTCGToken {
    $value: string | number | boolean | Record<string, unknown>;
    $type: DTCGTokenType;
    $description?: string;
}
/** A group of tokens or nested groups */
export type DTCGTokenGroup = {
    [key: string]: DTCGToken | DTCGTokenGroup;
};
/** Root tokens.json structure */
export type TokensJson = DTCGTokenGroup;
/** Figma variable (raw from get_variable_defs) */
export interface FigmaVariable {
    id: string;
    name: string;
    collectionId: string;
    collectionName: string;
    type: "COLOR" | "FLOAT" | "STRING" | "BOOLEAN";
    /** Values per mode (light/dark) */
    valuesByMode: Record<string, unknown>;
    scopes: string[];
}
/** Result of the DTCG extractor */
export interface ExtractedTokens {
    tokens: TokensJson;
    /** Map from Figma variable ID to DTCG path (e.g. "color.primary.500") */
    variableIdToDtcgPath: Record<string, string>;
}
/** Style Dictionary output paths */
export interface StyleDictionaryOutputs {
    css: string;
    tailwind: string;
    typescript: string;
    scss: string;
    json: string;
}
//# sourceMappingURL=tokens.d.ts.map