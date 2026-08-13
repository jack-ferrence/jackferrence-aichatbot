import { prisma } from "@/lib/prisma";

/**
 * Fetches a chat only if it belongs to the given user. Returns null
 * for both "not found" and "not owned" so callers can't distinguish
 * the two cases and probe for other users' chat IDs.
 */
export async function getOwnedChat(chatId: string, userId: string) {
  return prisma.chat.findFirst({
    where: { id: chatId, userId },
  });
}

export function deriveTitleFromMessage(content: string) {
  const trimmed = content.trim().replace(/\s+/g, " ");
  if (trimmed.length <= 60) return trimmed || "New conversation";
  return `${trimmed.slice(0, 57)}...`;
}
