import { Router, Request, Response } from "express";
import { authenticate, requireEmailVerified } from "../middleware/auth";
import prisma from "../lib/prisma";
import {
  getUserPosts,
  getPostById,
  getPostByShareId,
  getPublishedPostsByUser,
  updatePost,
  deletePost,
} from "../services/post";
import logger from "../lib/logger";

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
    logger.error({ err: error, route: "GET /posts/shared/:shareId" }, "Shared post error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/users/:userId/published", async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId as string;
    const [user, posts] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, name: true },
      }),
      getPublishedPostsByUser(userId),
    ]);

    if (!user || posts.length === 0) {
      res.status(404).json({ error: "Publisher published posts not found" });
      return;
    }

    res.json({ user, posts });
  } catch (error) {
    logger.error(
      { err: error, route: "GET /posts/users/:userId/published", userId: req.params.userId },
      "Get publisher published posts error"
    );
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
    logger.error({ err: error, route: "GET /posts", userId: req.user?.userId }, "List posts error");
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
    logger.error({ err: error, route: "GET /posts/:id", userId: req.user?.userId }, "Get post error");
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
    logger.error({ err: error, route: "PATCH /posts/:id", userId: req.user?.userId }, "Update post error");
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
    logger.error({ err: error, route: "DELETE /posts/:id", userId: req.user?.userId }, "Delete post error");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
