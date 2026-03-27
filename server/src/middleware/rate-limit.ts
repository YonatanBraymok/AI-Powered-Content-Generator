import rateLimit from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import type { RedisReply } from "rate-limit-redis";
import redis from "../lib/redis";

function makeStore(prefix: string) {
  if (!process.env.REDIS_URL) return undefined;
  return new RedisStore({
    sendCommand: (...args: string[]) =>
      redis.call(...(args as [string, ...string[]])) as Promise<RedisReply>,
    prefix,
  });
}

export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  store: makeStore("rl:general"),
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  store: makeStore("rl:auth"),
});

export const generateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  store: makeStore("rl:generate"),
});

export const passwordResetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  store: makeStore("rl:passwordReset"),
});
