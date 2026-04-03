# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Setup (first time)
npm run setup          # install deps + prisma generate + run migrations

# Development
npm run dev            # Next.js dev server with Turbopack at localhost:3000

# Build & Production
npm run build
npm run start

# Testing
npm run test           # run all vitest tests
npx vitest run <path>  # run a single test file

# Linting
npm run lint

# Database
npm run db:reset       # drop and recreate SQLite database
```

## Architecture

UIGen is a full-stack AI-powered React component generator. Users describe UI components in a chat interface; the AI writes files into a virtual file system, and the result renders live in a preview iframe.

### Key layers

**Next.js App Router** — two main routes:
- `/` — home, redirects authenticated users to their project
- `/[projectId]` — the main workspace (chat + code editor + preview)
- `/api/chat` — streaming AI chat endpoint (POST)

**LLM integration** (`src/lib/provider.ts`, `src/app/api/chat/route.ts`):
- Uses `claude-haiku-4-5` via Anthropic SDK when `ANTHROPIC_API_KEY` is set; falls back to `MockLanguageModel` for offline dev
- The chat route streams responses via Vercel AI SDK's `streamText`, executing two tools: `str_replace_editor` (create/edit files) and `file_manager` (rename/delete)
- After the stream completes, chat history and file system state are persisted to the database

**Virtual file system** (`src/lib/file-system.ts`):
- In-memory only — no disk writes during generation
- `VirtualFileSystem` class is serializable (stored as JSON in the `Project` table)
- AI tools manipulate it; the `FileSystemContext` exposes it to client components

**State management** (React Context):
- `FileSystemContext` — virtual file system state, synced from server after load
- `ChatContext` — wraps Vercel AI SDK's `useChat`, manages messages and project saving

**Authentication** (`src/lib/auth.ts`, `src/actions/index.ts`):
- JWT sessions via `jose`, bcrypt password hashing, cookies
- Protected by `src/middleware.ts`; server actions handle sign-up/in/out

**Database** (Prisma + SQLite):
- Schema: `User` and `Project` (project stores JSON messages + JSON file system)
- Migrations live in `prisma/migrations/`

### Path alias
`@/*` maps to `src/*` throughout the codebase.

### UI
- Tailwind CSS v4 with CSS variables
- shadcn/ui components (New York style) + Radix UI primitives
- Monaco Editor for code viewing/editing
- Resizable split panels: Chat (left) | Preview+Code (right)

### Tests
Vitest + Testing Library + jsdom. Test files live in `__tests__` folders alongside the code they test. Coverage spans context providers, key components, and utility classes (`VirtualFileSystem`, `jsx-transformer`).
