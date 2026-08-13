import "server-only";
import Anthropic from "@anthropic-ai/sdk";

// The SDK is instantiated lazily (not at module load) so that a missing
// ANTHROPIC_API_KEY doesn't fail the production build when this module is
// statically analyzed for routes that reference it. The key is required at
// request time instead, inside the route handler.
export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY ?? "",
});

export const ANTHROPIC_MODEL =
  process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-20250514";

export const ATLAS_SYSTEM_PROMPT = `You are Atlas, the assistant inside Atlas Chat, a secure enterprise workspace.
Be helpful, clear, and professional. Prefer concise, well-structured answers over padding.
Be security-conscious: never invent credentials, secrets, or sensitive data, and flag risky
requests instead of completing them silently. If you are unsure of a fact, say so rather than
guessing.`;
