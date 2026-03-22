import { Router, Request, Response } from "express";
import { z } from "zod";
import { authenticate, requireEmailVerified } from "../middleware/auth";
import { generateContent } from "../services/openai";
import { createPost } from "../services/post";
import logger from "../lib/logger";

const router = Router();

router.use(authenticate);
router.use(requireEmailVerified);

const generateSchema = z.object({
  topic: z.string().min(1, "Topic is required"),
  style: z.string().min(1, "Style is required"),
  title: z.string().optional(),
});

router.post("/", async (req: Request, res: Response) => {
  try {
    const result = generateSchema.safeParse(req.body);
    if (!result.success) {
      const errors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0];
        if (field !== undefined && !errors[String(field)]) {
          errors[String(field)] = issue.message;
        }
      }
      res.status(400).json({ errors });
      return;
    }

    const { topic, style, title } = result.data;
    const generated = await generateContent({ topic, style, title });

    const post = await createPost({
      title: generated.title,
      topic,
      style,
      content: generated.content,
      userId: req.user!.userId,
    });

    res.status(201).json({ post });
  } catch (error) {
    logger.error({ err: error, route: "POST /generate", userId: req.user?.userId }, "Generate error");
    res.status(500).json({ error: "Content generation failed" });
  }
});

export default router;
