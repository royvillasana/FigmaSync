import type { Express } from "express";

import { healthRouter } from "./health.js";
import { projectsRouter } from "./projects.js";
import { webhooksRouter } from "./webhooks.js";

export function registerRoutes(app: Express): void {
  app.use("/health", healthRouter);
  app.use("/api/webhooks", webhooksRouter);
  app.use("/api/projects", projectsRouter);
}
