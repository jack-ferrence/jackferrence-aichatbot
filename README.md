# Jack Ferrence AI Chat

A secure, multi-user AI chat workspace. Every user signs in, keeps their own set of
conversations, and talks to Claude through a server-side integration — the browser
never sees an API key. Built with Next.js (App Router), PostgreSQL/Prisma, Auth.js
credentials authentication, and the Anthropic SDK.

## Tech stack

- **Framework:** Next.js 16 (App Router, TypeScript, Turbopack)
- **Database / ORM:** PostgreSQL + Prisma 6
- **Auth:** Auth.js (NextAuth v5) with a Credentials provider, bcrypt password hashing, JWT sessions
- **AI:** `@anthropic-ai/sdk`, called only from server-side route handlers
- **Styling:** Tailwind CSS 4

## Local setup

### 1. Prerequisites

- Node.js 20+
- A running PostgreSQL server (local install, Docker, or hosted)

### 2. Install dependencies

```bash
npm install
```

This also runs `prisma generate` automatically via a `postinstall` script.

### 3. Configure environment variables

Copy the example file and fill in real values:

```bash
cp .env.example .env
```

| Variable | Description |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string, e.g. `postgresql://user:password@localhost:5432/atlas_chat?schema=public` |
| `ANTHROPIC_API_KEY` | API key from the [Anthropic Console](https://console.anthropic.com/settings/keys) |
| `ANTHROPIC_MODEL` | Model id to use, e.g. `claude-sonnet-4-20250514` |
| `AUTH_SECRET` | Random secret used to sign session cookies. Generate with `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Base URL of the app, `http://localhost:3000` for local dev |

### 4. Set up the database

Create a database that matches your `DATABASE_URL` (skip if it already exists):

```bash
createdb atlas_chat
```

Apply the Prisma schema:

```bash
npx prisma migrate dev
```

This creates the `User`, `Chat`, and `Message` tables and generates the Prisma Client.

### 5. Run the app

```bash
npm run dev
```

Visit `http://localhost:3000`. You'll be redirected to `/sign-up` to create an account.

### Production build

```bash
npm run build
npm run start
```

## Prisma commands

| Command | Purpose |
| --- | --- |
| `npx prisma migrate dev` | Create/apply a migration in development |
| `npx prisma generate` | Regenerate the Prisma Client (runs automatically on `npm install`) |
| `npm run db:studio` | Open Prisma Studio, a GUI for inspecting the database |
| `npx prisma migrate deploy` | Apply pending migrations in production/CI |

## Data model

```
User      id, email (unique), passwordHash, createdAt, updatedAt
Chat      id, userId → User, title, createdAt, updatedAt
Message   id, chatId → Chat, role (user | assistant), content, createdAt
```

- `Chat.userId` and `Message.chatId` both cascade on delete.
- There is no separate `Account`/`Session` table: sessions use Auth.js's **JWT**
  strategy, so the session token itself (not a DB row) carries the user id. This
  keeps the schema minimal while still being fully compatible with Auth.js — a
  database-backed session strategy could be swapped in later via a Prisma adapter
  without changing the `User`/`Chat`/`Message` tables.

## Auth model

- Passwords are hashed with `bcryptjs` (cost factor 12) and never stored in plaintext.
- Sign-up (`POST /api/register`) and the Auth.js Credentials `authorize` callback both
  validate input server-side with `zod`.
- Sessions are JWTs, delivered via the http-only, secure-in-production cookies that
  Auth.js manages automatically — there is no custom cookie handling.
- `src/proxy.ts` (Next.js's proxy/middleware convention) redirects unauthenticated
  requests to `/sign-in` and authenticated users away from `/sign-in` and `/sign-up`.
  Its matcher deliberately excludes `/api/*` (API routes can't usefully be redirected
  to a sign-in page) — every chat/message API route calls `auth()` itself and returns
  401 if there's no session, so authorization doesn't depend on the proxy running.
- The Credentials `authorize()` callback runs `bcrypt.compare()` against a dummy hash
  when the email doesn't exist, so a login attempt takes the same amount of time
  whether or not the account is real. Without this, an unknown email returns
  near-instantly (no hash to compare against) while a real one takes the full
  bcrypt time, letting an attacker enumerate registered emails by timing responses.
- `/api/register` does return a distinct "account already exists" error for a
  duplicate email (a 409, not a generic failure). That's a conscious tradeoff, not an
  oversight: telling users their email is already registered is standard sign-up UX
  (GitHub, Google, etc. all do this), and treating it as a security leak would mean
  either silently failing sign-up for existing users or emailing a "did you mean to
  sign in?" notice — the latter is the more correct fix but needs an email-sending
  system this project doesn't have.

## Ownership enforcement

Every chat and message query is scoped to the signed-in user's id, not just the
requested resource id:

```ts
// src/lib/chats.ts
export async function getOwnedChat(chatId: string, userId: string) {
  return prisma.chat.findFirst({ where: { id: chatId, userId } });
}
```

All chat/message routes (`GET/POST /api/chats`, `GET/DELETE /api/chats/[chatId]`,
`POST /api/chats/[chatId]/messages`) and the `/chat/[chatId]` page call this helper
and return a generic 404 ("Chat not found") for both "doesn't exist" and "belongs to
someone else" — so a signed-in user cannot distinguish a guessed ID from a real one
they don't own. This was verified with an automated Playwright script that signs in
as two different users and confirms user B gets a 404 opening user A's chat URL.

## Security notes

- `ANTHROPIC_API_KEY` is read only inside server-side route handlers
  (`src/app/api/chats/[chatId]/messages/route.ts` via `src/lib/anthropic/client.ts`,
  marked with the `server-only` import guard). It is never passed to a Client
  Component and never appears in any bundle shipped to the browser.
- All mutating API routes re-check `auth()` server-side before touching the database;
  the UI hiding a button is never treated as access control.
- Both the sign-up route and the Credentials `authorize` callback validate input with
  `zod` before hitting the database.
- `.env` is git-ignored; `.env.example` documents required variables with no real
  values.

