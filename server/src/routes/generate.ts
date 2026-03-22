import { Router, Request, Response } from "express";
import { authenticate, requireEmailVerified } from "../middleware/auth";
import { generateContent } from "../services/openai";
import { createPost } from "../services/post";

const router = Router();

router.use(authenticate);
router.use(requireEmailVerified);

router.post("/", async (req: Request, res: Response) => {
  try {
    const { topic, style, title } = req.body;

    if (!topic || !style) {
      res.status(400).json({ error: "Topic and style are required" });
      return;
    }

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
    console.error("Generate error:", error);
    res.status(500).json({ error: "Content generation failed" });
  }
});

export default router;
