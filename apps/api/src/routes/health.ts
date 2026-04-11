import { Router } from "express";

import { getRedis } from "../config/redis.js";

export const healthRouter = Router();

healthRouter.get("/", async (_req, res) => {
  const redis = getRedis();
  let redisOk = false;
  try {
    await Promise.race([
      redis.ping().then(() => { redisOk = true; }),
      new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), 1000)),
    ]);
  } catch {}

  res.json({
    status: "ok",
    redis: redisOk ? "ok" : "unavailable",
    timestamp: new Date().toISOString(),
  });
});
