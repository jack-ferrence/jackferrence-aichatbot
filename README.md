# Atlas Chat

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

## Implementation notes and tradeoffs

**AI tooling used:** This project was built with Claude Code (Sonnet 5) as a pair
programmer, driven by an unusually detailed spec from the requester (stack, data
model, UI layout, and env vars were all specified up front). I wrote the code
directly through the agent rather than pasting in isolated snippets — schema,
routes, and components were built in the same session so they'd stay consistent
with each other.

**What I personally verified**, using a real Postgres database and a running dev
server (not just reading the code):
- `npm run lint` and `npm run build` both pass cleanly with no warnings suppressed.
- End-to-end flows via an automated Playwright script: sign-up → redirect to the
  empty state → send first message → land in the new chat → sign-out → sign back in
  → conversation still listed → a second account is blocked (404) from the first
  account's chat by URL → an unauthenticated visitor is redirected to `/sign-in`.
- Server-side validation: duplicate email registration returns 409, a too-short
  password returns 400, both without reaching the database write.
- The Claude integration's **failure path**: with no `ANTHROPIC_API_KEY` set, sending
  a message returns a clean 502/500 and the UI shows a readable error instead of
  crashing, both from the empty-state composer and from an existing conversation.
- A **live Claude call** with a real API key: signed up, sent "In one short sentence,
  what is the Atlas system in Greek mythology known for?", and confirmed both the
  stored user message and a correct, on-topic assistant reply in Postgres. This also
  caught a real bug — `claude-sonnet-4-20250514` (the model id from the original
  spec/`.env.example`) returns a `not_found_error` on a current API key; I switched
  the default to `claude-sonnet-4-5-20250929`, a currently-available model, and left
  `ANTHROPIC_MODEL` overridable per the spec. If you use an older key/org, check
  `GET /v1/models` for what's actually available to you.

**Decisions I made that weren't fully specified:**
- **JWT sessions, no Account/Session tables.** The spec asked for whatever "the
  chosen auth system" needs; a Credentials provider with JWT sessions doesn't need
  an adapter or those tables, so I left them out rather than adding unused schema.
- **Chat titles** are derived from the first ~60 characters of the user's first
  message rather than asking Claude to summarize it — cheaper and simpler, at the
  cost of sometimes-awkward titles for short first messages.
- **Prisma major version.** `create-next-app`'s `prisma init` defaulted to Prisma 7,
  which requires a driver-adapter pattern and moves the connection URL out of
  `schema.prisma` into `prisma.config.ts`. I pinned to Prisma 6 (`prisma-client-js`,
  the classic generator) instead — it's the well-documented, widely-used shape and
  a better fit for a project meant to be readable and cloned by someone else.
- **First message on a new chat** is handed from the empty-state composer to the
  chat page via `sessionStorage` (see `src/lib/pending-message.ts`) rather than
  sent before navigating. The first version blocked navigation on the Claude call
  succeeding, which meant a failed first message silently stranded the user on the
  home page with an orphaned empty chat; this version always navigates into the chat
  once it's created, and the chat view's existing send/error/retry UI handles the
  rest. Found via the Playwright test, not by inspection.

**Known limitations / what I'd improve with more time:**
- No streaming — responses are returned in one shot after Claude finishes, per the
  spec's explicit allowance for a non-streaming response. Streaming would improve
  perceived latency for longer replies.
- No conversation rename or delete UI (the `DELETE /api/chats/[chatId]` route exists
  and is ownership-checked, but nothing in the UI calls it yet).
- No automated test suite (unit/integration). Verification here was manual +
  scripted Playwright smoke tests, not a checked-in test suite — I'd add one before
  treating this as production-ready.
- No rate limiting on `/api/register` or the message-send route; a real deployment
  should add it to control both abuse and Anthropic API spend.
- Message history sent to Claude is capped at the last 20 messages with no token-
  aware trimming or summarization — long conversations will eventually hit context
  limits.

## Deployment notes

This app is stateless aside from Postgres, so it deploys cleanly to any Node hosting
platform (Vercel, Fly.io, Railway, Render, etc.). Set the same environment variables
from `.env.example` in the platform's dashboard, point `DATABASE_URL` at a managed
Postgres instance, and run `npx prisma migrate deploy` as part of your deploy step
(not `migrate dev`, which prompts interactively and is meant for local development).
