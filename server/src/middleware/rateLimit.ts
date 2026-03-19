import rateLimit from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import Redis from "ioredis";

function createStore() {
  if (!process.env.REDIS_URL) return undefined;

  try {
    const client = new Redis(process.env.REDIS_URL);
    return new RedisStore({
      sendCommand: (command: string, ...args: string[]) =>
        client.call(command, ...args) as any,
    });
  } catch {
    console.warn("Redis unavailable — falling back to in-memory rate limiting");
    return undefined;
  }
}

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  store: createStore(),
  message: { error: "Too many requests, please try again later" },
});

export const generateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  store: createStore(),
  message: { error: "Generation rate limit exceeded, please wait" },
});
