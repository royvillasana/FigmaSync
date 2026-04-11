const HtmlWebpackPlugin = require("html-webpack-plugin");
const HtmlInlineScriptPlugin = require("html-inline-script-webpack-plugin");
const webpack = require("webpack");
const path = require("path");

const WS_URL = process.env.WS_URL || "ws://localhost:3001";

const sharedResolve = {
  extensions: [".tsx", ".ts", ".js"],
  extensionAlias: {
    ".js": [".tsx", ".ts", ".js"],
    ".jsx": [".tsx", ".jsx"],
  },
  // Treat @uxbridge/types as CJS so webpack doesn't choke on "type":"module"
  conditionNames: ["require", "node", "default"],
};

const sharedTsRule = {
  test: /\.tsx?$/,
  use: "ts-loader",
  exclude: /node_modules/,
};

module.exports = (env, argv) => {
  const isDev = argv.mode === "development";

  return [
    // Plugin sandbox (code.ts → dist/code.js)
    {
      mode: argv.mode,
      target: "web",
      entry: "./src/code.ts",
      output: {
        filename: "code.js",
        path: path.resolve(__dirname, "dist"),
      },
      module: { rules: [sharedTsRule] },
      resolve: sharedResolve,
      plugins: [
        new webpack.DefinePlugin({
          __WS_URL__: JSON.stringify(WS_URL),
        }),
      ],
      devtool: isDev ? "inline-source-map" : false,
    },
    // Plugin UI (ui.tsx → dist/ui.html)
    {
      mode: argv.mode,
      target: "web",
      entry: "./src/ui.tsx",
      output: {
        filename: "ui.js",
        path: path.resolve(__dirname, "dist"),
      },
      module: {
        rules: [
          sharedTsRule,
          {
            test: /\.css$/,
            use: ["style-loader", "css-loader"],
          },
        ],
      },
      resolve: sharedResolve,
      plugins: [
        new HtmlWebpackPlugin({
          filename: "ui.html",
          template: "./src/ui.html",
          inject: "body",
        }),
        new HtmlInlineScriptPlugin(),
      ],
      devtool: isDev ? "inline-source-map" : false,
    },
  ];
};
