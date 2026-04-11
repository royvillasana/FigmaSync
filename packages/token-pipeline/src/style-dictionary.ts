/**
 * Style Dictionary v4 runner
 * Input:  tokens/tokens.json  (W3C DTCG format)
 * Outputs:
 *   tokens/css/variables.css
 *   tokens/tailwind/config.ts
 *   tokens/js/tokens.ts
 *   tokens/scss/variables.scss
 *   tokens/json/flat.json
 */

import StyleDictionary from "style-dictionary";

export async function buildTokens(tokensInputPath = "tokens/tokens.json") {
  const sd = new StyleDictionary({
    source: [tokensInputPath],
    platforms: {
      css: {
        transformGroup: "css",
        buildPath: "tokens/css/",
        files: [
          {
            destination: "variables.css",
            format: "css/variables",
            options: { outputReferences: true },
          },
        ],
      },
      tailwind: {
        transformGroup: "js",
        buildPath: "tokens/tailwind/",
        files: [
          {
            destination: "config.ts",
            format: "javascript/es6",
          },
        ],
      },
      ts: {
        transformGroup: "js",
        buildPath: "tokens/js/",
        files: [
          {
            destination: "tokens.ts",
            format: "typescript/es6-declarations",
          },
        ],
      },
      scss: {
        transformGroup: "scss",
        buildPath: "tokens/scss/",
        files: [
          {
            destination: "variables.scss",
            format: "scss/variables",
          },
        ],
      },
      json: {
        transformGroup: "js",
        buildPath: "tokens/json/",
        files: [
          {
            destination: "flat.json",
            format: "json/flat",
          },
        ],
      },
    },
  });

  await sd.buildAllPlatforms();
  console.log("✅ Style Dictionary build complete");
}

// Run directly when called as script
if (process.argv[1] === import.meta.url) {
  buildTokens().catch((err) => {
    console.error("Style Dictionary build failed:", err);
    process.exit(1);
  });
}
