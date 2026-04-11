import IORedis from "ioredis";

import { env } from "./env.js";

let redisInstance: IORedis | null = null;

export function getRedis(): IORedis {
  if (!redisInstance) {
    redisInstance = new IORedis(env.REDIS_URL, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      lazyConnect: true,
      retryStrategy: (times) => {
        // Cap retries at 10 seconds, keep retrying silently
        return Math.min(times * 500, 10_000);
      },
    });

    redisInstance.on("error", () => {
      // Suppress — Redis is optional in dev
    });
  }
  return redisInstance;
}
