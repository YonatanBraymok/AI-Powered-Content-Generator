import "dotenv/config";
import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth";
import postRoutes from "./routes/posts";
import generateRoutes from "./routes/generate";
import {
  generalLimiter,
  authLimiter,
  generateLimiter,
} from "./middleware/rate-limit";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api", generalLimiter);
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/generate", generateLimiter, generateRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
