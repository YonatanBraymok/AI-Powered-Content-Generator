export interface User {
  id: string;
  email: string;
  name: string;
  createdAt?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Post {
  id: string;
  title: string;
  topic: string;
  style: string;
  content: string;
  isPublished: boolean;
  shareId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  user?: { name: string };
}

export interface GenerateInput {
  topic: string;
  style: string;
  title?: string;
}
