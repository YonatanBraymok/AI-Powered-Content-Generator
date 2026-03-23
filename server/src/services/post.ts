import prisma from "../lib/prisma";

export async function createPost(data: {
  title: string;
  topic: string;
  style: string;
  content: string;
  userId: string;
}) {
  return prisma.post.create({ data });
}

export async function getUserPosts(userId: string) {
  return prisma.post.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

export async function getPostById(id: string, userId: string) {
  return prisma.post.findFirst({ where: { id, userId } });
}

export async function getPostByShareId(shareId: string) {
  return prisma.post.findUnique({
    where: { shareId, isPublished: true },
    include: { user: { select: { name: true } } },
  });
}

export async function getPublishedPostsByUser(userId: string) {
  return prisma.post.findMany({
    where: { userId, isPublished: true },
    orderBy: { createdAt: "desc" },
    include: { user: { select: { id: true, name: true } } },
  });
}

export async function updatePost(
  id: string,
  userId: string,
  data: Partial<{
    title: string;
    content: string;
    isPublished: boolean;
  }>
) {
  const post = await prisma.post.findFirst({ where: { id, userId } });
  if (!post) return null;

  return prisma.post.update({ where: { id }, data });
}

export async function deletePost(id: string, userId: string) {
  const post = await prisma.post.findFirst({ where: { id, userId } });
  if (!post) return null;

  return prisma.post.delete({ where: { id } });
}
