import "dotenv/config";
import http from "http";

import { env } from "./config/env.js";
import { createApp } from "./app.js";
import { createWSServer } from "./websocket/ws-server.js";

const app = createApp();
const httpServer = http.createServer(app);
const wss = createWSServer(httpServer);

httpServer.listen(env.PORT, () => {
  console.log(`✅ UxBridge API listening on http://localhost:${env.PORT}`);
  console.log(`✅ WebSocket server on ws://localhost:${env.PORT}/ws`);
});

process.on("SIGTERM", () => {
  console.log("SIGTERM received — shutting down gracefully");
  wss.close();
  httpServer.close(() => process.exit(0));
});
