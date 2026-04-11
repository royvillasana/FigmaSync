/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  extends: ["@uxbridge/config/eslint/base"],
  ignorePatterns: [
    "node_modules/",
    "dist/",
    ".next/",
    "*.config.js",
    "*.config.ts",
    "commitlint.config.js",
  ],
};
