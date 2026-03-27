import { Request, Response, NextFunction } from "express";
import redis from "../lib/redis";

export function cacheResponse(ttlSeconds: number) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const key = `cache:${req.originalUrl}`;
    try {
      const cached = await redis.get(key);
      if (cached) {
        res.setHeader("X-Cache", "HIT");
        res.json(JSON.parse(cached));
        return;
      }
    } catch {
      // Redis unavailable — fall through to DB
    }

    const originalJson = res.json.bind(res);
    res.json = (body) => {
      redis.setex(key, ttlSeconds, JSON.stringify(body)).catch(() => {});
      res.setHeader("X-Cache", "MISS");
      return originalJson(body);
    };
    next();
  };
}
