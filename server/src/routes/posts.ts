import { Router, Request, Response } from "express";
import { authenticate, requireEmailVerified } from "../middleware/auth";
import {
  getUserPosts,
  getPostById,
  getPostByShareId,
  updatePost,
  deletePost,
} from "../services/post";

const router = Router();

router.get("/shared/:shareId", async (req: Request, res: Response) => {
  try {
    const post = await getPostByShareId(req.params.shareId as string);
    if (!post) {
      res.status(404).json({ error: "Post not found" });
      return;
    }
    res.json({ post });
  } catch (error) {
    console.error("Shared post error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.use(authenticate);
router.use(requireEmailVerified);

router.get("/", async (req: Request, res: Response) => {
  try {
    const posts = await getUserPosts(req.user!.userId);
    res.json({ posts });
  } catch (error) {
    console.error("List posts error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:id", async (req: Request, res: Response) => {
  try {
    const post = await getPostById(req.params.id as string, req.user!.userId);
    if (!post) {
      res.status(404).json({ error: "Post not found" });
      return;
    }
    res.json({ post });
  } catch (error) {
    console.error("Get post error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/:id", async (req: Request, res: Response) => {
  try {
    const { title, content, isPublished } = req.body;
    const post = await updatePost(req.params.id as string, req.user!.userId, {
      title,
      content,
      isPublished,
    });

    if (!post) {
      res.status(404).json({ error: "Post not found" });
      return;
    }

    res.json({ post });
  } catch (error) {
    console.error("Update post error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const post = await deletePost(req.params.id as string, req.user!.userId);
    if (!post) {
      res.status(404).json({ error: "Post not found" });
      return;
    }
    res.json({ message: "Post deleted" });
  } catch (error) {
    console.error("Delete post error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
