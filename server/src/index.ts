import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth";
import postRoutes from "./routes/posts";
import generateRoutes from "./routes/generate";
import profileRoutes from "./routes/profile";
import {
  generalLimiter,
  authLimiter,
  generateLimiter,
} from "./middleware/rate-limit";
import logger from "./lib/logger";

const requiredEnvVars = [
  "DATABASE_URL",
  "JWT_SECRET",
  "GEMINI_API_KEY",
  "RESEND_API_KEY",
  "FROM_EMAIL",
  "APP_URL",
] as const;

for (const key of requiredEnvVars) {
  if (!process.env[key]) {
    logger.error(`[startup] Missing required environment variable: ${key}`);
    process.exit(1);
  }
}

const app = express();
app.set("trust proxy", 1);
const PORT = process.env.PORT || 4000;

app.use(
  cors({
    origin: process.env.APP_URL || "http://localhost:3000",
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api", generalLimiter);
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/generate", generateLimiter, generateRoutes);
app.use("/api/profile", profileRoutes);

app.use((_req: express.Request, res: express.Response) => {
  res.status(404).json({ error: "Not found" });
});

app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    logger.error({ err }, "Unhandled error");
    res.status(500).json({ error: "Internal server error" });
  },
);

app.listen(PORT, () => {
  logger.info({ port: PORT }, "Server running");
});

export default app;
