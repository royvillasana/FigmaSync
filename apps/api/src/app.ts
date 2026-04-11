import cors from "cors";
import express from "express";

import { registerRoutes } from "./routes/index.js";

export function createApp() {
  const app = express();

  app.use(cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (Figma plugin iframe, curl, etc.)
      if (!origin) return callback(null, true);
      const allowed = [
        process.env["APP_URL"] ?? "http://localhost:3000",
        "http://localhost:3000",
        "http://localhost:3001",
      ];
      if (allowed.includes(origin)) return callback(null, true);
      callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
  }));
  app.use(express.json({ limit: "5mb" }));

  registerRoutes(app);

  app.use(
    (
      err: Error,
      _req: express.Request,
      res: express.Response,
      _next: express.NextFunction,
    ) => {
      console.error("[API Error]", err.message);
      res.status(500).json({ error: err.message });
    },
  );

  return app;
}
