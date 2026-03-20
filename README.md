# AI-Powered Content Generator

A full-stack web application that uses Google Gemini AI to generate blog-style content. Users can register, generate posts by providing a topic and writing style, edit and manage their posts, and share published content via public links.

## Tech Stack

| Layer      | Technology                                                     |
| ---------- | -------------------------------------------------------------- |
| Frontend   | Next.js 16, React 19, Tailwind CSS 4, TanStack React Query    |
| Backend    | Node.js, Express 5, TypeScript                                 |
| Database   | PostgreSQL 16, Prisma 7 ORM                                   |
| AI         | Google Gemini 2.5 Flash (`@google/genai`)                      |
| Auth       | JWT (jsonwebtoken), bcryptjs                                   |
| Cache      | Redis 7 (rate-limiting store)                                  |
| Infra      | Docker, Docker Compose                                         |
| UI         | shadcn, Lucide icons, Sonner toasts                            |

## Project Structure

```
├── client/                  # Next.js frontend
│   └── src/
│       ├── app/
│       │   ├── (auth)/      # Login & register pages
│       │   ├── (dashboard)/ # Protected dashboard & post editor
│       │   └── posts/       # Public shared post view
│       ├── components/      # Reusable UI components
│       ├── hooks/           # Custom React hooks (auth, posts, generate)
│       └── lib/             # API client, auth helpers, types
├── server/                  # Express API server
│   ├── prisma/
│   │   └── schema.prisma    # Database schema
│   └── src/
│       ├── middleware/       # Auth & rate-limiting middleware
│       ├── routes/          # API route handlers
│       └── services/        # AI generation & post services
└── docker-compose.yml       # Full-stack orchestration
```

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/install/)
- A [Google Gemini API key](https://ai.google.dev/)

For local development without Docker:

- Node.js 20+
- PostgreSQL 16
- Redis 7

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/YonatanBraymok/AI-Powered-Content-Generator.git
cd AI-Powered-Content-Generator
```

### 2. Configure environment variables

Create a `.env` file in the project root:

```env
GEMINI_API_KEY=your-gemini-api-key
JWT_SECRET=your-secret-key
```

### 3. Start with Docker Compose

```bash
docker compose up --build -d
```

This starts all four services:

| Service    | URL                      | Description               |
| ---------- | ------------------------ | ------------------------- |
| **client** | http://localhost:3000     | Next.js frontend          |
| **server** | http://localhost:4000     | Express API               |
| **postgres** | localhost:5432         | PostgreSQL database       |
| **redis**  | localhost:6379           | Redis cache               |

The server automatically runs `prisma db push` on startup to sync the database schema.

### 4. Use the app

1. Open http://localhost:3000
2. Register a new account
3. Generate content by entering a topic and selecting a writing style
4. Edit, publish, or delete posts from the dashboard
5. Share published posts via their public link

## Local Development (without Docker)

### Server

```bash
cd server
cp .env.example .env   # or create .env manually (see below)
npm install
npx prisma db push
npm run dev
```

Required `server/.env`:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/content_generator?schema=public"
JWT_SECRET="your-secret-key"
GEMINI_API_KEY="your-gemini-api-key"
REDIS_URL="redis://localhost:6379"
PORT=4000
```

### Client

```bash
cd client
npm install
npm run dev
```

The client reads `NEXT_PUBLIC_API_URL` at build time (defaults to `http://localhost:4000`).

## API Reference

### Auth

| Method | Endpoint             | Auth | Description            |
| ------ | -------------------- | ---- | ---------------------- |
| POST   | `/api/auth/register` | No   | Create a new account   |
| POST   | `/api/auth/login`    | No   | Sign in                |
| GET    | `/api/auth/me`       | Yes  | Get current user       |

### Posts

| Method | Endpoint                      | Auth | Description                  |
| ------ | ----------------------------- | ---- | ---------------------------- |
| GET    | `/api/posts`                  | Yes  | List current user's posts    |
| GET    | `/api/posts/:id`              | Yes  | Get a post by ID             |
| PATCH  | `/api/posts/:id`              | Yes  | Update a post                |
| DELETE | `/api/posts/:id`              | Yes  | Delete a post                |
| GET    | `/api/posts/shared/:shareId`  | No   | Get a published post (public)|

### Generate

| Method | Endpoint         | Auth | Description                |
| ------ | ---------------- | ---- | -------------------------- |
| POST   | `/api/generate`  | Yes  | Generate AI content        |

**Generate request body:**

```json
{
  "topic": "The future of AI",
  "style": "professional",
  "title": "Optional custom title"
}
```

All authenticated endpoints expect an `Authorization: Bearer <token>` header.

## Rate Limiting

| Scope        | Limit              |
| ------------ | ------------------ |
| General API  | 100 requests / 15 min |
| Auth routes  | 10 requests / 15 min  |
| Generate     | 10 requests / 60 sec  |

## Database Schema

```
User
├── id        (cuid, PK)
├── email     (unique)
├── password  (bcrypt hash)
├── name
├── createdAt
└── posts     → Post[]

Post
├── id          (cuid, PK)
├── title
├── topic
├── style
├── content
├── isPublished (default: false)
├── shareId     (unique cuid)
├── userId      (FK → User, cascade delete)
├── createdAt
└── updatedAt
```

## Environment Variables Reference

| Variable              | Required | Where          | Description                          |
| --------------------- | -------- | -------------- | ------------------------------------ |
| `GEMINI_API_KEY`      | Yes      | Root `.env`    | Google Gemini API key                |
| `JWT_SECRET`          | Yes      | Root `.env`    | Secret for signing JWT tokens        |
| `DATABASE_URL`        | Yes*     | `server/.env`  | PostgreSQL connection string         |
| `REDIS_URL`           | No       | `server/.env`  | Redis connection string              |
| `PORT`                | No       | `server/.env`  | Server port (default: 4000)          |
| `NEXT_PUBLIC_API_URL` | No       | Build arg      | API URL for client (default: http://localhost:4000) |

*Provided automatically by Docker Compose when running with Docker.

## Useful Commands

```bash
# Start all services
docker compose up --build -d

# View server logs
docker compose logs server -f

# Stop all services
docker compose down

# Stop and remove volumes (resets database)
docker compose down -v

# Rebuild a single service
docker compose up --build server -d
```

## Deploying to Render (Blueprint)

The repo includes [`render.yaml`](render.yaml) for a one-click [Render Blueprint](https://render.com/docs/infrastructure-as-code):

- **PostgreSQL** (`content-generator-db`)
- **API** (`content-generator-server`) — Docker image from `server/`
- **Web app** (`content-generator-client`) — **Node** runtime (`npm run build` + `npm start` in `client/`) so Next.js App Router and `/_next/static` assets work reliably

When you apply the Blueprint, set **`GEMINI_API_KEY`** when prompted. After deploy, open the **`content-generator-client`** service URL in the dashboard.

If you change the API URL, redeploy the client so `NEXT_PUBLIC_API_URL` is rebuilt.
